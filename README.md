![Markex Cover Image](https://res.cloudinary.com/zs1l3nt/image/upload/repositories/web-next-markex.png)

# Markex

![License](https://img.shields.io/github/license/zS1L3NT/web-next-markex?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/web-next-markex?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/web-next-markex?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/web-next-markex?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/web-next-markex?style=for-the-badge)

Markex is a website that displays Stock prices, Stock insights, Forex prices, Forex insights, and News related to the markets. Users also can bookmark their favorite Stock companies and Forex pairs to keep track of them.

## Motivation

I needed a deliverable for my DBFS (Digital Banking and Financial Services) submissions, so I decided to build a website revolving around FOREX prices and Fidor API.

I was also asked to improve this website and present it at TP InfoTech Day, so it was also added to the list of deliverables for my FYP (Final Year Project).

## Features

-	News
	-	Latest market news
		-	FXStreet scraping
	-	Event Calendar
		-	FXEmpire scraping
-	FOREX Prices
	-	Oanda scraping
	-	Websocket scraping
-	Stock Prices
	-	Finnhub REST API
	-	Alpaca REST API
	-	Alpaca Websocket API

## Usage

Copy the `.env.example` file to `.env` then fill in the correct project credentials
 
```
$ pnpm i
$ pnpm dev
```

## Credits

Data sources:
-	[FXStreet](https://www.fxstreet.com/)
-	[FXEmpire](https://www.fxempire.com/)
-	[Oanda](https://www.oanda.com/)
-	[Alpaca](https://alpaca.markets/)
-	[Finnhub](https://finnhub.io/)

## Built with

-	TypeScript
	-	TypeScript
        -   [![@types/node](https://img.shields.io/badge/%40types%2Fnode-20.1.5-red?style=flat-square)](https://npmjs.com/package/@types/node/v/20.1.5)
        -   [![@types/react](https://img.shields.io/badge/%40types%2Freact-18.2.6-red?style=flat-square)](https://npmjs.com/package/@types/react/v/18.2.6)
        -   [![@types/react-dom](https://img.shields.io/badge/%40types%2Freact--dom-18.2.4-red?style=flat-square)](https://npmjs.com/package/@types/react-dom/v/18.2.4)
        -   [![arktype](https://img.shields.io/badge/arktype-1.0.14--alpha-red?style=flat-square)](https://npmjs.com/package/arktype/v/1.0.14-alpha)
        -   [![typescript](https://img.shields.io/badge/typescript-5.0.4-red?style=flat-square)](https://npmjs.com/package/typescript/v/5.0.4)
	-	NextJS
        -   [![next](https://img.shields.io/badge/next-13.4.2-red?style=flat-square)](https://npmjs.com/package/next/v/13.4.2)
        -   [![react](https://img.shields.io/badge/react-18.2.0-red?style=flat-square)](https://npmjs.com/package/react/v/18.2.0)
        -   [![react-dom](https://img.shields.io/badge/react--dom-18.2.0-red?style=flat-square)](https://npmjs.com/package/react-dom/v/18.2.0)
	-	Mantine
        -   [![@emotion/react](https://img.shields.io/badge/%40emotion%2Freact-%5E11.11.1-red?style=flat-square)](https://npmjs.com/package/@emotion/react/v/11.11.1)
        -   [![@emotion/server](https://img.shields.io/badge/%40emotion%2Fserver-%5E11.11.0-red?style=flat-square)](https://npmjs.com/package/@emotion/server/v/11.11.0)
        -   [![@mantine/core](https://img.shields.io/badge/%40mantine%2Fcore-%5E6.0.21-red?style=flat-square)](https://npmjs.com/package/@mantine/core/v/6.0.21)
        -   [![@mantine/dates](https://img.shields.io/badge/%40mantine%2Fdates-%5E6.0.21-red?style=flat-square)](https://npmjs.com/package/@mantine/dates/v/6.0.21)
        -   [![@mantine/form](https://img.shields.io/badge/%40mantine%2Fform-%5E6.0.21-red?style=flat-square)](https://npmjs.com/package/@mantine/form/v/6.0.21)
        -   [![@mantine/hooks](https://img.shields.io/badge/%40mantine%2Fhooks-%5E6.0.21-red?style=flat-square)](https://npmjs.com/package/@mantine/hooks/v/6.0.21)
        -   [![@mantine/modals](https://img.shields.io/badge/%40mantine%2Fmodals-%5E6.0.21-red?style=flat-square)](https://npmjs.com/package/@mantine/modals/v/6.0.21)
        -   [![@mantine/next](https://img.shields.io/badge/%40mantine%2Fnext-%5E6.0.21-red?style=flat-square)](https://npmjs.com/package/@mantine/next/v/6.0.21)
        -   [![@mantine/notifications](https://img.shields.io/badge/%40mantine%2Fnotifications-%5E6.0.21-red?style=flat-square)](https://npmjs.com/package/@mantine/notifications/v/6.0.21)
        -   [![@tabler/icons-react](https://img.shields.io/badge/%40tabler%2Ficons--react-%5E2.34.0-red?style=flat-square)](https://npmjs.com/package/@tabler/icons-react/v/2.34.0)
	-	Redux Toolkit
        -   [![@reduxjs/toolkit](https://img.shields.io/badge/%40reduxjs%2Ftoolkit-%5E1.9.5-red?style=flat-square)](https://npmjs.com/package/@reduxjs/toolkit/v/1.9.5)
        -   [![react-redux](https://img.shields.io/badge/react--redux-%5E8.1.2-red?style=flat-square)](https://npmjs.com/package/react-redux/v/8.1.2)
	-	PostgresQL
        -   [![@prisma/client](https://img.shields.io/badge/%40prisma%2Fclient-4.14.1-red?style=flat-square)](https://npmjs.com/package/@prisma/client/v/4.14.1)
        -   [![prisma](https://img.shields.io/badge/prisma-%5E4.16.2-red?style=flat-square)](https://npmjs.com/package/prisma/v/4.16.2)
	-	ESLint
        -   [![@typescript-eslint/eslint-plugin](https://img.shields.io/badge/%40typescript--eslint%2Feslint--plugin-latest-red?style=flat-square)](https://npmjs.com/package/@typescript-eslint/eslint-plugin/v/latest)
        -   [![@typescript-eslint/parser](https://img.shields.io/badge/%40typescript--eslint%2Fparser-latest-red?style=flat-square)](https://npmjs.com/package/@typescript-eslint/parser/v/latest)
        -   [![eslint](https://img.shields.io/badge/eslint-latest-red?style=flat-square)](https://npmjs.com/package/eslint/v/latest)
        -   [![eslint-config-next](https://img.shields.io/badge/eslint--config--next-latest-red?style=flat-square)](https://npmjs.com/package/eslint-config-next/v/latest)
        -   [![eslint-config-prettier](https://img.shields.io/badge/eslint--config--prettier-latest-red?style=flat-square)](https://npmjs.com/package/eslint-config-prettier/v/latest)
        -   [![eslint-plugin-react](https://img.shields.io/badge/eslint--plugin--react-latest-red?style=flat-square)](https://npmjs.com/package/eslint-plugin-react/v/latest)
        -   [![eslint-plugin-simple-import-sort](https://img.shields.io/badge/eslint--plugin--simple--import--sort-latest-red?style=flat-square)](https://npmjs.com/package/eslint-plugin-simple-import-sort/v/latest)
        -   [![prettier](https://img.shields.io/badge/prettier-latest-red?style=flat-square)](https://npmjs.com/package/prettier/v/latest)
	-	Miscellaneous
        -   [![arktype](https://img.shields.io/badge/arktype-1.0.14--alpha-red?style=flat-square)](https://npmjs.com/package/arktype/v/1.0.14-alpha)
        -   [![axios](https://img.shields.io/badge/axios-%5E1.5.0-red?style=flat-square)](https://npmjs.com/package/axios/v/1.5.0)
        -   [![cookies-next](https://img.shields.io/badge/cookies--next-%5E4.0.0-red?style=flat-square)](https://npmjs.com/package/cookies-next/v/4.0.0)
        -   [![fast-array-diff](https://img.shields.io/badge/fast--array--diff-%5E1.1.0-red?style=flat-square)](https://npmjs.com/package/fast-array-diff/v/1.1.0)
        -   [![framer-motion](https://img.shields.io/badge/framer--motion-%5E10.16.4-red?style=flat-square)](https://npmjs.com/package/framer-motion/v/10.16.4)
        -   [![highcharts](https://img.shields.io/badge/highcharts-%5E11.1.0-red?style=flat-square)](https://npmjs.com/package/highcharts/v/11.1.0)
        -   [![highcharts-react-official](https://img.shields.io/badge/highcharts--react--official-%5E3.2.1-red?style=flat-square)](https://npmjs.com/package/highcharts-react-official/v/3.2.1)
        -   [![iron-session](https://img.shields.io/badge/iron--session-%5E6.3.1-red?style=flat-square)](https://npmjs.com/package/iron-session/v/6.3.1)
        -   [![next-auth](https://img.shields.io/badge/next--auth-%5E4.23.1-red?style=flat-square)](https://npmjs.com/package/next-auth/v/4.23.1)
        -   [![next-pwa](https://img.shields.io/badge/next--pwa-%5E5.6.0-red?style=flat-square)](https://npmjs.com/package/next-pwa/v/5.6.0)
        -   [![react-use-websocket](https://img.shields.io/badge/react--use--websocket-%5E4.4.0-red?style=flat-square)](https://npmjs.com/package/react-use-websocket/v/4.4.0)
        -   [![use-is-in-viewport](https://img.shields.io/badge/use--is--in--viewport-%5E1.0.9-red?style=flat-square)](https://npmjs.com/package/use-is-in-viewport/v/1.0.9)