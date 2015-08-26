package web

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/smira/aptly/aptly"
	"github.com/smira/aptly/deb"
)

//GET /api/repos
func listRepo(c *gin.Context) {
	result := api.RepoList()

	c.JSON(200, result)
}

//POST /api/repos
func createRepo(c *gin.Context) {
	var b struct {
		Name                string `binding:"required"`
		Comment             string
		DefaultDistribution string
		DefaultComponent    string
	}

	if !c.Bind(&b) {
		return
	}

	repo, err := api.RepoCreate(b.Name, b.Comment, b.DefaultDistribution, b.DefaultComponent)
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(201, repo)

}

//PUT /api/repos/:name
func editRepo(c *gin.Context) {
	var b struct {
		Comment             string
		DefaultDistribution string
		DefaultComponent    string
	}

	if !c.Bind(&b) {
		return
	}

	repo, err := api.RepoEdit(c.Params.ByName("name"), func(r *deb.LocalRepo) {
		if b.Comment != "" {
			r.Comment = b.Comment
		}
		if b.DefaultDistribution != "" {
			r.DefaultDistribution = b.DefaultDistribution
		}
		if b.DefaultComponent != "" {
			r.DefaultComponent = b.DefaultComponent
		}
	})
	if err != nil {
		c.Fail(500, err)
		return
	}
	c.JSON(200, repo)
}

//GET /api/repos/:name
func showRepo(c *gin.Context) {
	repo, err := api.RepoShow(c.Params.ByName("name"))
	if err != nil {
		c.Fail(404, err)
		return
	}
	c.JSON(200, repo)
}

//DELETE /api/repos/:name
func dropRepo(c *gin.Context) {
	force := c.Request.URL.Query().Get("force") == "1"

	err := api.RepoDelete(c.Params.ByName("name"), force)
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, gin.H{})
}

//GET /api/repos/:name/packages
func repoShowPackages(c *gin.Context) {
	packages, err := api.RepoShowPackages(c.Params.ByName("name"))
	if err != nil {
		c.Fail(404, err)
		return
	}
	c.JSON(200, packages)
}

//GET /api/repos/:name/packages/detail
func repoShowPackagesDetail(c *gin.Context) {
	packages, err := api.RepoShowPackagesDetail(c.Params.ByName("name"))
	if err != nil {
		c.Fail(404, err)
		return
	}
	c.JSON(200, packages)
}

//POST /api/repos/:name/packages/delete
func repoDeletePackage(c *gin.Context) {
	var b struct {
		PackageRef string
	}
	if !c.Bind(&b) {
		return
	}

	err := api.RepoDeletePackage(c.Params.ByName("name"), b.PackageRef)
	if err != nil {
		c.Fail(404, err)
		return
	}
	c.JSON(200, gin.H{})
}

func verifyPath(path string) bool {
	path = filepath.Clean(path)
	for _, part := range strings.Split(path, string(filepath.Separator)) {
		if part == ".." || part == "." {
			return false
		}
	}
	return true
}

func exists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

//POST /api/repos/:name/packages
func repoAddPackage(c *gin.Context) {
	replace := c.Request.URL.Query().Get("replace") == "1"
	err := c.Request.ParseMultipartForm(10 * 1024 * 1024)
	if err != nil {
		c.Fail(400, err)
		return
	}

	uploadPathExists, err := exists(api.Ctx().UploadPath())
	if err != nil {
		c.Fail(500, err)
		return
	}

	if !uploadPathExists {
		os.MkdirAll(api.Ctx().UploadPath(), 0755)
	}

	path, err := ioutil.TempDir(api.Ctx().UploadPath(), "tmp")
	if err != nil {
		c.Fail(500, err)
		return
	}
	err = os.MkdirAll(path, 0755)
	if err != nil {
		c.Fail(500, err)
		return
	}

	type report struct {
		Report *aptly.RecordingResultReporter
		Failed []string
		File   string
	}

	stored := []report{}

	for _, files := range c.Request.MultipartForm.File {
		for _, file := range files {
			if !verifyPath(file.Filename) {
				c.Fail(400, fmt.Errorf("invalid filename %s", file.Filename))
				return
			}
			src, err := file.Open()
			if err != nil {
				c.Fail(500, err)
				return
			}
			defer src.Close()

			destPath := filepath.Join(path, filepath.Base(file.Filename))
			dst, err := os.Create(destPath)
			if err != nil {
				c.Fail(500, err)
				return
			}
			defer dst.Close()

			_, err = io.Copy(dst, src)
			if err != nil {
				c.Fail(500, err)
				return
			}
			reporter, failed, err := api.RepoAddFile(c.Params.ByName("name"), destPath, true, replace)
			if err != nil {
				c.Fail(500, err)
				return
			}
			if err := os.Remove(path); err != nil {
				c.Fail(500, err)
				return
			}
			stored = append(stored, report{
				Report: reporter,
				Failed: failed,
				File:   filepath.Base(file.Filename),
			})
		}
	}

	c.JSON(200, stored)
}
