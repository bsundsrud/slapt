package web

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func jobList(c *gin.Context) {
	handles := workerPool.GetStatus()
	c.JSON(200, handles)
}

func jobDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Params.ByName("id"), 10, 64)
	if err != nil {
		c.Fail(400, err)
		return
	}
	handle, err := workerPool.GetStatusById(id)
	if err != nil {
		c.Fail(404, err)
		return
	}
	c.JSON(200, handle)
}

func jobClearAll(c *gin.Context) {
	workerPool.ClearCompleted()
	c.JSON(200, gin.H{})
}

func jobClearById(c *gin.Context) {
	id, err := strconv.ParseUint(c.Params.ByName("id"), 10, 64)
	if err != nil {
		c.Fail(400, err)
		return
	}
	err = workerPool.ClearById(id)
	if err != nil {
		c.Fail(404, err)
		return
	}
	c.JSON(200, gin.H{})
}
