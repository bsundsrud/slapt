package web

import (
	"github.com/gin-gonic/gin"
	"github.com/smira/aptly/deb"
	"go.stash.c42/slapt/worker"
)

//GET /api/mirrors
func mirrorList(c *gin.Context) {
	result := api.MirrorList()
	c.JSON(200, result)
}

//POST /api/mirrors
func mirrorCreate(c *gin.Context) {
	var b struct {
		Name            string   `binding:"required"`
		ArchiveUrl      string   `binding:"required"`
		Distribution    string   `binding:"required"`
		Components      []string `binding:"required"`
		Filter          string
		FilterWithDeps  bool
		WithSources     bool
		WithUdebs       bool
		ForceComponents bool
	}

	if !c.Bind(&b) {
		return
	}

	//name, url, filter, distribution string, components []string, withSources, withUdebs, filterWithDeps, forceComponents bool
	repo, err := api.MirrorCreate(b.Name, b.ArchiveUrl, b.Filter, b.Distribution, b.Components, b.WithSources, b.WithUdebs, b.FilterWithDeps, b.ForceComponents)
	if err != nil {
		c.Fail(400, err)
		return
	}

	c.JSON(200, repo)
}

type updateTask struct {
	mirrorName      string
	forceUpdate     bool
	ignoreChecksums bool
}

func newUpdateTask(mirrorName string, forceUpdate, ignoreChecksums bool) *updateTask {
	return &updateTask{
		mirrorName:      mirrorName,
		forceUpdate:     forceUpdate,
		ignoreChecksums: ignoreChecksums,
	}
}

func (u *updateTask) Execute() (string, error) {
	err := api.MirrorUpdate(u.mirrorName, u.forceUpdate, u.ignoreChecksums)
	if err != nil {
		return "", err
	}
	return "Mirror Updated Sucessfully.", nil
}

func (u *updateTask) GetInfo() worker.JobInfo {
	return worker.JobInfo{
		Type: "update_mirror",
		Key:  u.mirrorName,
	}
}

func mirrorUpdate(c *gin.Context) {
	force := c.Request.URL.Query().Get("force") == "1"
	ignoreChecksums := c.Request.URL.Query().Get("force") == "1"
	name := c.Params.ByName("name")
	task := newUpdateTask(name, force, ignoreChecksums)
	id := workerPool.Exec(task)
	c.JSON(200, gin.H{"JobId": id})
}

func mirrorShow(c *gin.Context) {
	mirror, err := api.MirrorShow(c.Params.ByName("name"))
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, mirror)
}

func mirrorEdit(c *gin.Context) {
	var b struct {
		Filter         string
		FilterWithDeps bool
		Architectures  []string
		WithSources    bool
		WithUdebs      bool
	}

	if !c.Bind(&b) {
		return
	}

	mirror, err := api.MirrorEdit(c.Params.ByName("name"), func(m *deb.RemoteRepo) error {
		m.Filter = b.Filter
		m.FilterWithDeps = b.FilterWithDeps
		m.DownloadSources = b.WithSources
		m.DownloadUdebs = b.WithUdebs
		m.Architectures = b.Architectures
		return nil
	})
	if err != nil {
		c.Fail(400, err)
		return
	}

	c.JSON(200, mirror)

}

func mirrorPackages(c *gin.Context) {
	packages, err := api.MirrorShowPackages(c.Params.ByName("name"))
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, packages)
}
