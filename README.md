# FSMS Sample

## yarn 설치

```sh
yarn install --offline
```

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## 폴더 그룹핑

### Private

`_folder`: 라우트에 포함하지 않을 경우 폴더 이름 앞에 `_` 붙임. 폴더에 `page.js`이 존재하더라도 무시함.

### Routing Group

`(group name)`: 라우트를 그룹화할 때 사용하며 라우팅 세그먼트에 영향을 주지 않음  
따라서 라우팅 그룹을 제외한 URL이 중복될 경우 에러 발생

예)

```bash
sample/post/(aa)/create
# http://domain.com/sample/post/create
sample/post/(bb)/create
# http://domain.com/sample/post/create

# => URL이 중복되므로 Error!
```
