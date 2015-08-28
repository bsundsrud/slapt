package web

import (
	"net/http"
	"time"

	data_api "github.com/bsundsrud/slapt/api"

	"github.com/gin-gonic/gin"
	ctx "github.com/smira/aptly/context"
	"github.com/bsundsrud/slapt/worker"
)

var api *data_api.Api
var workerPool *worker.WorkerPool

func Router(c *ctx.AptlyContext) http.Handler {
	api = data_api.NewApi(c)

	workerPool = worker.NewWorkerPool(4)

	go cacheFlusher()

	router := gin.Default()
	router.Use(gin.ErrorLogger())

	router.Static("/static", "./html")

	root := router.Group("/api")

	{
		root.GET("/repos", listRepo)
		root.POST("/repos", createRepo)
		root.PUT("/repos/:name", editRepo)
		root.GET("/repos/:name", showRepo)
		root.DELETE("/repos/:name", dropRepo)
		root.GET("/repos/:name/packages", repoShowPackages)
		root.POST("/repos/:name/packages", repoAddPackage)
		root.GET("/repos/:name/packages/details", repoShowPackagesDetail)
		root.POST("/repos/:name/packages/delete", repoDeletePackage)
		root.POST("/repos/:name/snapshot", snapshotCreateFromRepo)
	}
	{
		root.GET("/mirrors", mirrorList)
		root.POST("/mirrors", mirrorCreate)
		root.GET("/mirrors/:name", mirrorShow)
		root.PUT("/mirrors/:name", mirrorEdit)
		root.GET("/mirrors/:name/packages", mirrorPackages)
		root.POST("/mirrors/:name/update", mirrorUpdate)
		root.POST("/mirrors/:name/snapshot", snapshotCreateFromMirror)
	}
	{
		root.GET("/jobs", jobList)
		root.DELETE("/jobs", jobClearAll)
		root.GET("/jobs/:id", jobDetail)
		root.DELETE("/jobs/:id", jobClearById)
	}
	{
		root.GET("/snapshots", snapshotList)
		root.POST("/snapshots", snapshotCreate)
		root.GET("/snapshots/:name", snapshotShow)
		root.DELETE("/snapshots/:name", snapshotDrop)
		root.PUT("/snapshots/:name", snapshotUpdateDescription)
		root.GET("/snapshots/:name/packages", snapshotPackages)
		root.GET("/snapshots/:name/diff/:other", snapshotDiff)
	}
	{
		root.GET("/publish", publishList)
		root.POST("/publish", publishRepoOrSnapshot)
		root.POST("/publish/:prefix", publishRepoOrSnapshot)
		root.PUT("/publish/:prefix/:distribution", publishSwitch)
		root.DELETE("/publish/:prefix/:distribution", publishDrop)
	}

	return router
}

func cacheFlusher() {
	ticker := time.Tick(15 * time.Minute)

	for {
		<-ticker

		// lock everything to eliminate in-progress calls
		r := api.Ctx().CollectionFactory().RemoteRepoCollection()
		r.Lock()
		defer r.Unlock()

		l := api.Ctx().CollectionFactory().LocalRepoCollection()
		l.Lock()
		defer l.Unlock()

		s := api.Ctx().CollectionFactory().SnapshotCollection()
		s.Lock()
		defer s.Unlock()

		p := api.Ctx().CollectionFactory().PublishedRepoCollection()
		p.Lock()
		defer p.Unlock()

		// all collections locked, flush them
		api.Ctx().CollectionFactory().Flush()
	}
}
