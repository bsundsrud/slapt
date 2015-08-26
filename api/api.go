package api

import (
	ctx "github.com/smira/aptly/context"
	"github.com/smira/aptly/utils"
)

type Api struct {
	context *ctx.AptlyContext
}

func (c *Api) Ctx() *ctx.AptlyContext {
	return c.context
}

func NewApi(context *ctx.AptlyContext) *Api {
	return &Api{
		context: context,
	}
}

// SigningOptions is a shared between publish API GPG options structure
type SigningOptions struct {
	Skip           bool
	Batch          bool
	GpgKey         string
	Keyring        string
	SecretKeyring  string
	Passphrase     string
	PassphraseFile string
}

func getSigner(options *SigningOptions) (utils.Signer, error) {
	if options.Skip {
		return nil, nil
	}

	signer := &utils.GpgSigner{}
	signer.SetKey(options.GpgKey)
	signer.SetKeyRing(options.Keyring, options.SecretKeyring)
	signer.SetPassphrase(options.Passphrase, options.PassphraseFile)
	signer.SetBatch(options.Batch)

	err := signer.Init()
	if err != nil {
		return nil, err
	}

	return signer, nil
}

func getVerifier(ignoreSignatures bool) (utils.Verifier, error) {
	if ignoreSignatures {
		return nil, nil
	}

	verifier := &utils.GpgVerifier{}
	verifier.AddKeyring("trusted.gpg")
	err := verifier.InitKeyring()
	if err != nil {
		return nil, err
	}

	return verifier, nil
}
