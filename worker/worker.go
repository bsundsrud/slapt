package worker

import (
	"fmt"
	"sync"
	"time"
)

type JobStatus uint

const (
	WAITING JobStatus = iota
	RUNNING
	COMPLETED
	FAILED
)

type Task interface {
	Execute() (string, error)
	GetInfo() JobInfo
}

type implTask struct {
	task   Task
	handle *JobHandle
}

type JobInfo struct {
	Type string
	Key  string
}

type JobHandle struct {
	Id               uint64
	Info             JobInfo
	Status           JobStatus
	LastStatusChange time.Time
	Message          string
}

func NewJobHandle(id uint64, info JobInfo) *JobHandle {
	return &JobHandle{
		Id:               id,
		Info:             info,
		Status:           WAITING,
		LastStatusChange: time.Now(),
		Message:          "",
	}
}

type JobUpdate struct {
	Id       uint64
	Status   JobStatus
	Progress float64
}

type WorkerPool struct {
	taskMeta map[uint64]*JobHandle
	mu       sync.Mutex
	wg       sync.WaitGroup
	kill     chan struct{}
	tasks    chan implTask
	size     int
	lastId   uint64
}

func NewWorkerPool(workers int) *WorkerPool {
	pool := &WorkerPool{
		kill:     make(chan struct{}),
		tasks:    make(chan implTask, 128),
		taskMeta: make(map[uint64]*JobHandle),
	}
	pool.Resize(workers)
	return pool
}

func (p *WorkerPool) worker() {
	defer p.wg.Done()
	for {
		select {
		case task, ok := <-p.tasks:
			if !ok {
				return
			}
			handle := task.handle
			p.updateStatusById(handle.Id, RUNNING, "")
			msg, err := task.task.Execute()
			var newStatus JobStatus
			if err != nil {
				newStatus = FAILED
			} else {
				newStatus = COMPLETED
			}
			p.updateStatusById(handle.Id, newStatus, msg)
		case <-p.kill:
			return
		}
	}
}

func (p *WorkerPool) ClearCompleted() {
	p.mu.Lock()
	defer p.mu.Unlock()
	for k, v := range p.taskMeta {
		if v.Status == COMPLETED || v.Status == FAILED {
			delete(p.taskMeta, k)
		}
	}
}

func (p *WorkerPool) ClearById(id uint64) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	if _, ok := p.taskMeta[id]; !ok {
		return fmt.Errorf("Unknown job id %d", id)
	}
	delete(p.taskMeta, id)
	return nil
}

func (p *WorkerPool) updateStatusById(id uint64, status JobStatus, message string) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.taskMeta[id].Message = message
	p.taskMeta[id].Status = status
	p.taskMeta[id].LastStatusChange = time.Now()
}

func (p *WorkerPool) Resize(workers int) {
	p.mu.Lock()
	defer p.mu.Unlock()
	for p.size < workers {
		p.size++
		p.wg.Add(1)
		go p.worker()
	}
	for p.size > workers {
		p.size--
		p.kill <- struct{}{}
	}

}

func (p *WorkerPool) GetStatus() []*JobHandle {
	p.mu.Lock()
	defer p.mu.Unlock()
	results := make([]*JobHandle, 0, len(p.taskMeta))
	for _, v := range p.taskMeta {
		results = append(results, v)
	}
	return results
}

func (p *WorkerPool) GetStatusById(id uint64) (*JobHandle, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	handle, ok := p.taskMeta[id]
	if !ok {
		return nil, fmt.Errorf("Unknown job id %d", id)
	}
	return handle, nil
}

func (p *WorkerPool) Close() {
	close(p.tasks)
}

func (p *WorkerPool) Wait() {
	p.wg.Wait()
}

func (p *WorkerPool) registerJob(j JobInfo) *JobHandle {
	p.mu.Lock()
	defer p.mu.Unlock()
	handle := NewJobHandle(p.lastId, j)
	p.taskMeta[p.lastId] = handle
	p.lastId++
	return handle
}

func (p *WorkerPool) Exec(t Task) uint64 {
	handle := p.registerJob(t.GetInfo())
	p.tasks <- implTask{
		task:   t,
		handle: handle,
	}
	return handle.Id
}
