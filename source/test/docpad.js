/* eslint no-console:0 */
'use strict'

// Import
const joe = require('joe')
const assert = require('assert-helpers')
const request = require('superagent')

// Prepare
const HTTP_NOT_FOUND = 404
const HTTP_OK = 200

// Task
joe.suite('docpad-helper', function (suite, test) {
	let app, serverURL

	test('app', function (done) {
		app = require('../app')
			.create({ plugins: ['app', 'docpad'] })
			.start(function (err) {
				if (err) return done(err)
				serverURL = app.state.app.serverURL
				console.log(`testing server listing on ${serverURL}`)
				done()
			})
	})

	test('should send 404 correctly', function (done) {
		const url = `${serverURL}`
		request.get(url).end(function (error, res) {
			assert.errorEqual(error, 'Not Found', 'error')
			assert.equal(res.statusCode, HTTP_NOT_FOUND, 'status code')
			assert.deepEqual(res.body, { success: false, error: '404 Not Found' }, 'body')
			done()
		})
	})

	test('should fetch ping correctly', function (done) {
		const url = `${serverURL}?method=ping`
		request.get(url).redirects(2).end(function (error, res) {
			assert.errorEqual(error, null, 'error')
			assert.equal(res.statusCode, HTTP_OK, 'status code')
			console.log(assert.inspect(res.body))
			assert.equal(res.body.success, true, 'success is true')
			done()
		})
	})

	test('should fetch latest correctly', function (done) {
		const url = `${serverURL}?method=latest`
		request.get(url).redirects(2).end(function (error, res) {
			assert.errorEqual(error, null, 'error')
			assert.equal(res.statusCode, HTTP_OK, 'status code')
			assert.equal(JSON.parse(res.text).name, 'docpad', 'latest docpad package.json was successfully fetched')
			done()
		})
	})

	test('should fetch skeletons correctly', function (done) {
		const url = `${serverURL}?method=skeletons&version=6.78.1`
		request.get(url).redirects(2).end(function (error, res) {
			assert.errorEqual(error, null, 'error')
			assert.equal(res.statusCode, HTTP_OK, 'status code')
			assert.equal(res.text.indexOf('h5bp') !== -1, true, 'h5bp skeleton was found')
			done()
		})
	})

	test('should fetch plugins correctly', function (done) {
		const url = `${serverURL}?method=plugins`
		request.get(url).end(function (error, res) {
			assert.errorEqual(error, null, 'error')
			assert.equal(res.statusCode, HTTP_OK, 'status code')
			assert.equal(Object.keys(res.body.plugins).length > 100, true, 'should have returned more than 100 plugins')
			done()
		})
	})

	test('should shutdown server correctly', function (done) {
		app.stop(done)
	})

})
