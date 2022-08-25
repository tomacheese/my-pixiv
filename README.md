# my-pixiv

Pixiv client for myself.

## Development

```powershell
venv\Scripts\activate
$env:PIXIVPY_TOKEN_FILE="token.json"
python -m uvicorn api.__main__:app --host=0.0.0.0 --port=8000 --reload`
```

```powershell
cd view
yarn
yarn dev
```
