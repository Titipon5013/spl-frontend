# Protected camera reverse proxy

This image extends the exact `winnkyaw/nginx-proxy` image currently used by the
production stack. Its registry digest resolves to the same image ID shown by
Portainer, preserving the senior-maintained proxy image and its other files.
Only `/etc/nginx/vhost.d/default_location` is replaced.

The active config sends `/parking`, `/parking2`, `/license`, and `/license1`
through the backend so it can validate the approved-account stream cookie on
every request. The legacy `/infer-live/` path returns `404` until it has an
authenticated backend route. The old direct-to-edge config is kept in
`legacy_default_location` inside the image for future reference, but must not
be enabled without equivalent authentication.

After merging the change, build and publish a versioned image manually from the
repository root:

```sh
docker login
docker build -t time5013/spl-reverseproxy:v1 ./reverseproxy
docker push time5013/spl-reverseproxy:v1
```

Then update the Portainer `smart-parking-lot` stack's `reverseproxy` service
image to:

```yaml
image: time5013/spl-reverseproxy:v1
```

Then update the stack with image pull enabled. The current stack config has no
mount for `/etc/nginx/vhost.d/default_location`, so the custom file must come
from this image.
