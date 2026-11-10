import test from 'node:test'
import assert from 'node:assert/strict'
import { filmState } from '../src/film.js'

test('the complete film is visible before confinement closes the frame', () => {
  assert.deepEqual(filmState(0), { poster: 1, film: 0, closure: 0, retreat: 0 })
  const endOfFilm = filmState(.84)
  assert.ok(Math.abs(endOfFilm.film - 1) < 1e-9)
  assert.equal(endOfFilm.closure, 0)
  assert.equal(endOfFilm.poster, 0)
  assert.equal(filmState(1).closure, 1)
})
test('reverse scrolling reverses the sequence without skipping or overshooting', () => {
  let previous = filmState(1)
  for (let i = 99; i >= 0; i--) {
    const current = filmState(i / 100)
    assert.ok(current.film <= previous.film)
    assert.ok(current.closure <= previous.closure)
    assert.ok(current.poster >= previous.poster)
    previous = current
  }
  assert.deepEqual(filmState(-1), filmState(0))
  assert.deepEqual(filmState(2), filmState(1))
})
test('reduced motion keeps a static identity frame throughout the scroll', () => {
  for (const p of [0, .25, .5, .75, 1]) assert.deepEqual(filmState(p, true), filmState(0, true))
})
