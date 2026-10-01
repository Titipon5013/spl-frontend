# Protected camera reverse proxy

This image extends the upstream `nginx-proxy` 1.8.0 image with a tracked
`default_location` file. It sends the four HLS path prefixes to the backend so
the backend can validate the approved-account stream cookie on every request.
The legacy `/infer-live/` path returns `404` until it has an authenticated
backend route.

The GitHub Actions workflow validates that the image builds. After merging the
change, publish a versioned image from the repository root:

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
