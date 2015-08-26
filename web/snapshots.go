package web

import "github.com/gin-gonic/gin"

func snapshotList(c *gin.Context) {
	sortMethod := c.Request.URL.Query().Get("sort")
	snapshots := api.SnapshotList(sortMethod)
	c.JSON(200, snapshots)
}

func snapshotCreateFromMirror(c *gin.Context) {
	var b struct {
		SnapshotName string `binding:"required"`
		Description  string
	}

	if !c.Bind(&b) {
		return
	}
	snapshot, err := api.SnapshotCreateFromMirror(c.Params.ByName("name"), b.SnapshotName, b.Description)
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, snapshot)
}

func snapshotCreate(c *gin.Context) {
	var b struct {
		SnapshotSources []string
		PackageRefs     []string
		SnapshotName    string `binding:"required"`
		Description     string
	}

	if !c.Bind(&b) {
		return
	}

	snapshot, err := api.SnapshotCreate(b.SnapshotName, b.Description, b.SnapshotSources, b.PackageRefs)
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, snapshot)
}

func snapshotCreateFromRepo(c *gin.Context) {
	var b struct {
		SnapshotName string `binding:"required"`
		Description  string
	}

	if !c.Bind(&b) {
		return
	}

	snapshot, err := api.SnapshotCreateFromRepo(c.Params.ByName("name"), b.SnapshotName, b.Description)
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, snapshot)
}

func snapshotUpdateDescription(c *gin.Context) {
	var b struct {
		Description string `binding:"required"`
	}

	if !c.Bind(&b) {
		return
	}
	snapshot, err := api.SnapshotUpdateDescription(c.Params.ByName("name"), b.Description)
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, snapshot)
}

func snapshotShow(c *gin.Context) {
	snapshot, err := api.SnapshotShow(c.Params.ByName("name"))
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, snapshot)
}

func snapshotDrop(c *gin.Context) {
	force := c.Request.URL.Query().Get("force") == "1"
	err := api.SnapshotDrop(c.Params.ByName("name"), force)
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, gin.H{})
}

func snapshotDiff(c *gin.Context) {
	onlyMatching := c.Request.URL.Query().Get("onlyMatching") == "1"
	diff, err := api.SnapshotDiff(c.Params.ByName("name"), c.Params.ByName("other"), onlyMatching)
	if err != nil {
		c.Fail(400, err)
		return
	}
	c.JSON(200, diff)
}

func snapshotPackages(c *gin.Context) {
	detail := c.Request.URL.Query().Get("detail") == "1"

	if detail {
		results, err := api.SnapshotShowPackagesDetail(c.Params.ByName("name"))
		if err != nil {
			c.Fail(400, err)
			return
		}
		c.JSON(200, results)
	} else {
		results, err := api.SnapshotShowPackages(c.Params.ByName("name"))
		if err != nil {
			c.Fail(400, err)
			return
		}
		c.JSON(200, results)
	}
}
