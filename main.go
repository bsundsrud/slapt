package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/bsundsrud/slapt/web"
	ctx "github.com/smira/aptly/context"
	"github.com/smira/commander"
	"github.com/smira/flag"
)

func rootCmd() *commander.Command {
	cmd := &commander.Command{
		UsageLine: "foo",
		Short:     "more foo",
		Long:      "Longer foo",
		Flag:      *flag.NewFlagSet("aptly", flag.ExitOnError),
	}
	cmd.Flag.String("config", "", "")
	cmd.Flag.String("architectures", "", "")
	cmd.Flag.Bool("dep-follow-suggests", false, "")
	cmd.Flag.Bool("dep-follow-source", false, "")
	cmd.Flag.Bool("dep-follow-recommends", false, "")
	cmd.Flag.Bool("dep-follow-all-variants", false, "")
	return cmd
}

func run(cmd *commander.Command) (returnCode int) {
	defer func() {
		if r := recover(); r != nil {
			fatal, ok := r.(*ctx.FatalError)
			if !ok {
				panic(r)
			}
			fmt.Fprintln(os.Stderr, "ERROR:", fatal.Message)
			returnCode = fatal.ReturnCode
		}
	}()
	returnCode = 0

	flags, _, err := cmd.ParseFlags([]string{"-config", "/home/benn/.slapt.conf"})
	if err != nil {
		ctx.Fatal(err)
	}

	err = initCtx(flags)
	if err != nil {
		ctx.Fatal(err)
	}
	defer shutdownContext()
	context.UpdateFlags(flags)

	err = http.ListenAndServe("localhost:8080", web.Router(context))
	if err != nil {
		ctx.Fatal(fmt.Errorf("unable to serve: %s", err))
	}

	return
}

var context *ctx.AptlyContext

func initCtx(flags *flag.FlagSet) error {
	var err error
	context, err = ctx.NewContext(flags)
	return err

}

func shutdownContext() {
	context.Shutdown()
}

func main() {
	os.Exit(run(rootCmd()))
}
