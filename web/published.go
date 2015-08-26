package web

import (
	data_api "go.stash.c42/slapt/api"

	"github.com/gin-gonic/gin"
)

func publishList(c *gin.Context) {
	results, err := api.PublishList()
	if err != nil {
		c.Fail(500, err)
		return
	}
	c.JSON(200, results)
}

func publishRepoOrSnapshot(c *gin.Context) {
	prefix := c.Params.ByName("prefix")
	var b struct {
		SourceKind     string
		Sources        []data_api.PublishSource
		Distribution   string
		Label          string
		Origin         string
		ForceOverwrite bool
		Architectures  []string
		Signing        data_api.SigningOptions
	}

	if !c.Bind(&b) {
		return
	}
	//prefix, distribution, label, origin string, sourceKind string, sources []PublishSource,
	// forceOverwrite bool, architectures []string, signingOptions SigningOptions
	repo, err := api.PublishRepoOrSnapshot(prefix, b.Distribution, b.Label, b.Origin, b.SourceKind, b.Sources, b.ForceOverwrite,
		b.Architectures, b.Signing)
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, repo)
}

func publishSwitch(c *gin.Context) {
	prefix := c.Params.ByName("prefix")
	distribution := c.Params.ByName("distribution")

	var b struct {
		ForceOverwrite bool
		Signing        data_api.SigningOptions
		Snapshots      []data_api.PublishSource
	}
	if !c.Bind(&b) {
		return
	}

	repo, err := api.PublishSwitch(prefix, distribution, b.Snapshots, b.ForceOverwrite, b.Signing)
	if err != nil {
		c.Fail(400, err)
		return
	}

	c.JSON(200, repo)
}

func publishDrop(c *gin.Context) {
	prefix := c.Params.ByName("prefix")
	distribution := c.Params.ByName("distribution")
	force := c.Request.URL.Query().Get("force") == "1"

	err := api.PublishDrop(prefix, distribution, force)
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, gin.H{})
}
