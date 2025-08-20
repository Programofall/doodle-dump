Required GitHub Secrets for `ios-fastlane.yml` workflow:

- IOS_P12_BASE64: Base64-encoded P12 certificate file (from Keychain Access export)
- IOS_P12_PASSWORD: Password for the P12 file
- IOS_PROFILE_BASE64: Base64-encoded provisioning profile (.mobileprovision)
- APP_IDENTIFIER: App bundle identifier (e.g., com.medmanager.app)
- EXPORT_METHOD: one of app-store, ad-hoc, enterprise, development
- APPLE_ID: Apple ID email used for Fastlane (optional if set in Appfile)

How to create base64 values (on macOS/Linux):

base64 -i Certificate.p12 > certificate.p12.base64
base64 -i profile.mobileprovision > profile.mobileprovision.base64

Copy contents into the GitHub secret values.

Using Fastlane Match (recommended for CI):

- MATCH_GIT_URL: git URL for your private repo that stores certificates (e.g. git@github.com:yourorg/certs-private.git)
- MATCH_PASSWORD: passphrase used by match to encrypt the repo
- MATCH_TYPE: certificate type to fetch (appstore, development, adhoc)

If you configure `MATCH_GIT_URL` and `MATCH_PASSWORD` in repository secrets, the `ios-fastlane.yml` workflow will use `fastlane match_and_build` to fetch certificates and provisioning profiles automatically.
