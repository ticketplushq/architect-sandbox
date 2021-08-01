let { join } = require('path')
let sut = join(process.cwd(), 'src', 'lib', 'flags')
let flags = require(sut)
let test = require('tape')
let args = process.argv
let port = process.env.PORT // jic set by test script
let cmd = i => {
  process.argv = [ '/path/to/node', 'some/file' ].concat(i)
  console.log('CLI args set:', process.argv)
}

test('Set up env', t => {
  t.plan(2)
  delete process.env.PORT
  t.ok(flags, 'Flags module is present')
  t.notOk(process.env.PORT, 'PORT not set')
})

test('Test logLevel flags', t => {
  t.plan(7)
  let f

  cmd([])
  f = flags(false)
  t.equal(f.logLevel, 'normal', `No log flags returned: normal`)

  cmd('-v')
  f = flags(false)
  t.equal(f.logLevel, 'verbose', `-v flag returned: verbose`)

  cmd('--verbose')
  f = flags(false)
  t.equal(f.logLevel, 'verbose', `-verbose flag returned: verbose`)

  cmd('verbose')
  f = flags(false)
  t.equal(f.logLevel, 'verbose', `verbose flag returned: verbose`)

  cmd('-d')
  f = flags(false)
  t.equal(f.logLevel, 'debug', `-d flag returned: debug`)

  cmd('--debug')
  f = flags(false)
  t.equal(f.logLevel, 'debug', `-debug flag returned: debug`)

  cmd('debug')
  f = flags(false)
  t.equal(f.logLevel, 'debug', `debug flag returned: debug`)
})

test('Test port flags', t => {
  t.plan(6)
  let f

  cmd([])
  f = flags(false)
  t.equal(f.port, 3333, `No port flags returned: 3333`)

  process.env.PORT = 1234
  f = flags(false)
  t.equal(f.port, 1234, `PORT env var returned: 1234`)

  cmd([ '-p', 'foo' ])
  f = flags(false)
  t.equal(f.port, 3333, `-p without specified port returned: 3333`)

  cmd([ '-p', '33333' ])
  f = flags(false)
  t.equal(f.port, 33333, `-p flag returned: 33333`)

  cmd([ '--port', '33333' ])
  f = flags(false)
  t.equal(f.port, 33333, `--port flag returned: 33333`)

  cmd([ 'port', '33333' ])
  f = flags(false)
  t.equal(f.port, 33333, `port flag returned: 33333`)
})

test('Test quiet flags', t => {
  t.plan(4)
  let f

  cmd([])
  f = flags(false)
  t.equal(f.quiet, false, `No quiet flags returned: false`)

  cmd([ '-q' ])
  f = flags(false)
  t.equal(f.quiet, true, `-q flag returned: true`)

  cmd([ '--quiet' ])
  f = flags(false)
  t.equal(f.quiet, true, `-quiet flag returned: true`)

  cmd([ 'quiet' ])
  f = flags(false)
  t.equal(f.quiet, true, `quiet flag returned: true`)
})

test('Test hydration symlinking flag', t => {
  t.plan(2)
  let f

  cmd([])
  f = flags(false)
  t.equal(f.symlink, false, `No symlink flags returned: false`)

  cmd([ '--disable-symlinks' ])
  f = flags(false)
  t.equal(f.symlink, true, `--disable-symlinks returned: true`)
})

test('Teardown', t => {
  t.plan(1)
  process.argv = args
  process.env.PORT = port
  t.pass('Reset process.argv + PORT')
})
