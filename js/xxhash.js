(function webpackUniversalModuleDefinition(root, factory) {
	if (typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if (typeof define === 'function' && define.amd)
		define([], factory);
	else if (typeof exports === 'object')
		exports["XXH"] = factory();
	else
		root["XXH"] = factory();
})(typeof self !== 'undefined' ? self : this, function () {
	return (function (modules) {
			var installedModules = {};

			function __webpack_require__(moduleId) {
				if (installedModules[moduleId]) {
					return installedModules[moduleId].exports;
				}
				var module = installedModules[moduleId] = {
					i: moduleId,
					l: false,
					exports: {}
				};
				modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
				module.l = true;
				return module.exports;
			}
			__webpack_require__.m = modules;
			__webpack_require__.c = installedModules;
			__webpack_require__.d = function (exports, name, getter) {
				if (!__webpack_require__.o(exports, name)) {
					Object.defineProperty(exports, name, {
						configurable: false,
						enumerable: true,
						get: getter
					});
				}
			};
			__webpack_require__.n = function (module) {
				var getter = module && module.__esModule ?
					function getDefault() {
						return module['default'];
					} :
					function getModuleExports() {
						return module;
					};
				__webpack_require__.d(getter, 'a', getter);
				return getter;
			};
			__webpack_require__.o = function (object, property) {
				return Object.prototype.hasOwnProperty.call(object, property);
			};
			__webpack_require__.p = "";
			return __webpack_require__(__webpack_require__.s = 2);
		})
		([
			(function (module, exports, __webpack_require__) {

				"use strict";
				/* WEBPACK VAR INJECTION */
				(function (global) {
					var base64 = __webpack_require__(5)
					var ieee754 = __webpack_require__(6)
					var isArray = __webpack_require__(7)

					exports.Buffer = Buffer
					exports.SlowBuffer = SlowBuffer
					exports.INSPECT_MAX_BYTES = 50
					Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined ?
						global.TYPED_ARRAY_SUPPORT :
						typedArraySupport()

					exports.kMaxLength = kMaxLength()

					function typedArraySupport() {
						try {
							var arr = new Uint8Array(1)
							arr.__proto__ = {
								__proto__: Uint8Array.prototype,
								foo: function () {
									return 42
								}
							}
							return arr.foo() === 42 && // typed array instances can be augmented
								typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
								arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
						} catch (e) {
							return false
						}
					}

					function kMaxLength() {
						return Buffer.TYPED_ARRAY_SUPPORT ?
							0x7fffffff :
							0x3fffffff
					}

					function createBuffer(that, length) {
						if (kMaxLength() < length) {
							throw new RangeError('Invalid typed array length')
						}
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							// Return an augmented `Uint8Array` instance, for best performance
							that = new Uint8Array(length)
							that.__proto__ = Buffer.prototype
						} else {
							// Fallback: Return an object instance of the Buffer class
							if (that === null) {
								that = new Buffer(length)
							}
							that.length = length
						}
						return that
					}

					function Buffer(arg, encodingOrOffset, length) {
						if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
							return new Buffer(arg, encodingOrOffset, length)
						}
						if (typeof arg === 'number') {
							if (typeof encodingOrOffset === 'string') {
								throw new Error(
									'If encoding is specified then the first argument must be a string'
								)
							}
							return allocUnsafe(this, arg)
						}
						return from(this, arg, encodingOrOffset, length)
					}

					Buffer.poolSize = 8192
					Buffer._augment = function (arr) {
						arr.__proto__ = Buffer.prototype
						return arr
					}

					function from(that, value, encodingOrOffset, length) {
						if (typeof value === 'number') {
							throw new TypeError('"value" argument must not be a number')
						}

						if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
							return fromArrayBuffer(that, value, encodingOrOffset, length)
						}

						if (typeof value === 'string') {
							return fromString(that, value, encodingOrOffset)
						}

						return fromObject(that, value)
					}
					Buffer.from = function (value, encodingOrOffset, length) {
						return from(null, value, encodingOrOffset, length)
					}

					if (Buffer.TYPED_ARRAY_SUPPORT) {
						Buffer.prototype.__proto__ = Uint8Array.prototype
						Buffer.__proto__ = Uint8Array
						if (typeof Symbol !== 'undefined' && Symbol.species &&
							Buffer[Symbol.species] === Buffer) {
							Object.defineProperty(Buffer, Symbol.species, {
								value: null,
								configurable: true
							})
						}
					}

					function assertSize(size) {
						if (typeof size !== 'number') {
							throw new TypeError('"size" argument must be a number')
						} else if (size < 0) {
							throw new RangeError('"size" argument must not be negative')
						}
					}

					function alloc(that, size, fill, encoding) {
						assertSize(size)
						if (size <= 0) {
							return createBuffer(that, size)
						}
						if (fill !== undefined) {
							// Only pay attention to encoding if it's a string. This
							// prevents accidentally sending in a number that would
							// be interpretted as a start offset.
							return typeof encoding === 'string' ?
								createBuffer(that, size).fill(fill, encoding) :
								createBuffer(that, size).fill(fill)
						}
						return createBuffer(that, size)
					}

					Buffer.alloc = function (size, fill, encoding) {
						return alloc(null, size, fill, encoding)
					}

					function allocUnsafe(that, size) {
						assertSize(size)
						that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
						if (!Buffer.TYPED_ARRAY_SUPPORT) {
							for (var i = 0; i < size; ++i) {
								that[i] = 0
							}
						}
						return that
					}

					Buffer.allocUnsafe = function (size) {
						return allocUnsafe(null, size)
					}
					/**
					 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
					 */
					Buffer.allocUnsafeSlow = function (size) {
						return allocUnsafe(null, size)
					}

					function fromString(that, string, encoding) {
						if (typeof encoding !== 'string' || encoding === '') {
							encoding = 'utf8'
						}

						if (!Buffer.isEncoding(encoding)) {
							throw new TypeError('"encoding" must be a valid string encoding')
						}
						var length = byteLength(string, encoding) | 0
						that = createBuffer(that, length)
						var actual = that.write(string, encoding)
						if (actual !== length) {
							that = that.slice(0, actual)
						}
						return that
					}

					function fromArrayLike(that, array) {
						var length = array.length < 0 ? 0 : checked(array.length) | 0
						that = createBuffer(that, length)
						for (var i = 0; i < length; i += 1) {
							that[i] = array[i] & 255
						}
						return that
					}

					function fromArrayBuffer(that, array, byteOffset, length) {
						array.byteLength // this throws if `array` is not a valid ArrayBuffer
						if (byteOffset < 0 || array.byteLength < byteOffset) {
							throw new RangeError('\'offset\' is out of bounds')
						}
						if (array.byteLength < byteOffset + (length || 0)) {
							throw new RangeError('\'length\' is out of bounds')
						}
						if (byteOffset === undefined && length === undefined) {
							array = new Uint8Array(array)
						} else if (length === undefined) {
							array = new Uint8Array(array, byteOffset)
						} else {
							array = new Uint8Array(array, byteOffset, length)
						}
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							that = array
							that.__proto__ = Buffer.prototype
						} else {
							that = fromArrayLike(that, array)
						}
						return that
					}

					function fromObject(that, obj) {
						if (Buffer.isBuffer(obj)) {
							var len = checked(obj.length) | 0
							that = createBuffer(that, len)
							if (that.length === 0) {
								return that
							}
							obj.copy(that, 0, 0, len)
							return that
						}
						if (obj) {
							if ((typeof ArrayBuffer !== 'undefined' &&
									obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
								if (typeof obj.length !== 'number' || isnan(obj.length)) {
									return createBuffer(that, 0)
								}
								return fromArrayLike(that, obj)
							}
							if (obj.type === 'Buffer' && isArray(obj.data)) {
								return fromArrayLike(that, obj.data)
							}
						}
						throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
					}

					function checked(length) {
						if (length >= kMaxLength()) {
							throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
								'size: 0x' + kMaxLength().toString(16) + ' bytes')
						}
						return length | 0
					}

					function SlowBuffer(length) {
						if (+length != length) { // eslint-disable-line eqeqeq
							length = 0
						}
						return Buffer.alloc(+length)
					}
					Buffer.isBuffer = function isBuffer(b) {
						return !!(b != null && b._isBuffer)
					}
					Buffer.compare = function compare(a, b) {
						if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
							throw new TypeError('Arguments must be Buffers')
						}
						if (a === b) return 0

						var x = a.length
						var y = b.length

						for (var i = 0, len = Math.min(x, y); i < len; ++i) {
							if (a[i] !== b[i]) {
								x = a[i]
								y = b[i]
								break
							}
						}
						if (x < y) return -1
						if (y < x) return 1
						return 0
					}
					Buffer.isEncoding = function isEncoding(encoding) {
						switch (String(encoding).toLowerCase()) {
							case 'hex':
							case 'utf8':
							case 'utf-8':
							case 'ascii':
							case 'latin1':
							case 'binary':
							case 'base64':
							case 'ucs2':
							case 'ucs-2':
							case 'utf16le':
							case 'utf-16le':
								return true
							default:
								return false
						}
					}

					Buffer.concat = function concat(list, length) {
						if (!isArray(list)) {
							throw new TypeError('"list" argument must be an Array of Buffers')
						}

						if (list.length === 0) {
							return Buffer.alloc(0)
						}

						var i
						if (length === undefined) {
							length = 0
							for (i = 0; i < list.length; ++i) {
								length += list[i].length
							}
						}

						var buffer = Buffer.allocUnsafe(length)
						var pos = 0
						for (i = 0; i < list.length; ++i) {
							var buf = list[i]
							if (!Buffer.isBuffer(buf)) {
								throw new TypeError('"list" argument must be an Array of Buffers')
							}
							buf.copy(buffer, pos)
							pos += buf.length
						}
						return buffer
					}

					function byteLength(string, encoding) {
						if (Buffer.isBuffer(string)) {
							return string.length
						}
						if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
							(ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
							return string.byteLength
						}
						if (typeof string !== 'string') {
							string = '' + string
						}

						var len = string.length
						if (len === 0) return 0

						var loweredCase = false
						for (;;) {
							switch (encoding) {
								case 'ascii':
								case 'latin1':
								case 'binary':
									return len
								case 'utf8':
								case 'utf-8':
								case undefined:
									return utf8ToBytes(string).length
								case 'ucs2':
								case 'ucs-2':
								case 'utf16le':
								case 'utf-16le':
									return len * 2
								case 'hex':
									return len >>> 1
								case 'base64':
									return base64ToBytes(string).length
								default:
									if (loweredCase) return utf8ToBytes(string).length // assume utf8
									encoding = ('' + encoding).toLowerCase()
									loweredCase = true
							}
						}
					}
					Buffer.byteLength = byteLength

					function slowToString(encoding, start, end) {
						var loweredCase = false
						if (start === undefined || start < 0) {
							start = 0
						}
						if (start > this.length) {
							return ''
						}
						if (end === undefined || end > this.length) {
							end = this.length
						}
						if (end <= 0) {
							return ''
						}

						end >>>= 0
						start >>>= 0
						if (end <= start) {
							return ''
						}

						if (!encoding) encoding = 'utf8'

						while (true) {
							switch (encoding) {
								case 'hex':
									return hexSlice(this, start, end)

								case 'utf8':
								case 'utf-8':
									return utf8Slice(this, start, end)

								case 'ascii':
									return asciiSlice(this, start, end)

								case 'latin1':
								case 'binary':
									return latin1Slice(this, start, end)

								case 'base64':
									return base64Slice(this, start, end)

								case 'ucs2':
								case 'ucs-2':
								case 'utf16le':
								case 'utf-16le':
									return utf16leSlice(this, start, end)

								default:
									if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
									encoding = (encoding + '').toLowerCase()
									loweredCase = true
							}
						}
					}
					Buffer.prototype._isBuffer = true

					function swap(b, n, m) {
						var i = b[n]
						b[n] = b[m]
						b[m] = i
					}

					Buffer.prototype.swap16 = function swap16() {
						var len = this.length
						if (len % 2 !== 0) {
							throw new RangeError('Buffer size must be a multiple of 16-bits')
						}
						for (var i = 0; i < len; i += 2) {
							swap(this, i, i + 1)
						}
						return this
					}

					Buffer.prototype.swap32 = function swap32() {
						var len = this.length
						if (len % 4 !== 0) {
							throw new RangeError('Buffer size must be a multiple of 32-bits')
						}
						for (var i = 0; i < len; i += 4) {
							swap(this, i, i + 3)
							swap(this, i + 1, i + 2)
						}
						return this
					}

					Buffer.prototype.swap64 = function swap64() {
						var len = this.length
						if (len % 8 !== 0) {
							throw new RangeError('Buffer size must be a multiple of 64-bits')
						}
						for (var i = 0; i < len; i += 8) {
							swap(this, i, i + 7)
							swap(this, i + 1, i + 6)
							swap(this, i + 2, i + 5)
							swap(this, i + 3, i + 4)
						}
						return this
					}

					Buffer.prototype.toString = function toString() {
						var length = this.length | 0
						if (length === 0) return ''
						if (arguments.length === 0) return utf8Slice(this, 0, length)
						return slowToString.apply(this, arguments)
					}

					Buffer.prototype.equals = function equals(b) {
						if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
						if (this === b) return true
						return Buffer.compare(this, b) === 0
					}

					Buffer.prototype.inspect = function inspect() {
						var str = ''
						var max = exports.INSPECT_MAX_BYTES
						if (this.length > 0) {
							str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
							if (this.length > max) str += ' ... '
						}
						return '<Buffer ' + str + '>'
					}

					Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
						if (!Buffer.isBuffer(target)) {
							throw new TypeError('Argument must be a Buffer')
						}

						if (start === undefined) {
							start = 0
						}
						if (end === undefined) {
							end = target ? target.length : 0
						}
						if (thisStart === undefined) {
							thisStart = 0
						}
						if (thisEnd === undefined) {
							thisEnd = this.length
						}

						if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
							throw new RangeError('out of range index')
						}

						if (thisStart >= thisEnd && start >= end) {
							return 0
						}
						if (thisStart >= thisEnd) {
							return -1
						}
						if (start >= end) {
							return 1
						}

						start >>>= 0
						end >>>= 0
						thisStart >>>= 0
						thisEnd >>>= 0

						if (this === target) return 0

						var x = thisEnd - thisStart
						var y = end - start
						var len = Math.min(x, y)

						var thisCopy = this.slice(thisStart, thisEnd)
						var targetCopy = target.slice(start, end)

						for (var i = 0; i < len; ++i) {
							if (thisCopy[i] !== targetCopy[i]) {
								x = thisCopy[i]
								y = targetCopy[i]
								break
							}
						}

						if (x < y) return -1
						if (y < x) return 1
						return 0
					}

					function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
						if (buffer.length === 0) return -1

						if (typeof byteOffset === 'string') {
							encoding = byteOffset
							byteOffset = 0
						} else if (byteOffset > 0x7fffffff) {
							byteOffset = 0x7fffffff
						} else if (byteOffset < -0x80000000) {
							byteOffset = -0x80000000
						}
						byteOffset = +byteOffset // Coerce to Number.
						if (isNaN(byteOffset)) {
							byteOffset = dir ? 0 : (buffer.length - 1)
						}

						if (byteOffset < 0) byteOffset = buffer.length + byteOffset
						if (byteOffset >= buffer.length) {
							if (dir) return -1
							else byteOffset = buffer.length - 1
						} else if (byteOffset < 0) {
							if (dir) byteOffset = 0
							else return -1
						}

						if (typeof val === 'string') {
							val = Buffer.from(val, encoding)
						}

						if (Buffer.isBuffer(val)) {
							if (val.length === 0) {
								return -1
							}
							return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
						} else if (typeof val === 'number') {
							val = val & 0xFF // Search for a byte value [0-255]
							if (Buffer.TYPED_ARRAY_SUPPORT &&
								typeof Uint8Array.prototype.indexOf === 'function') {
								if (dir) {
									return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
								} else {
									return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
								}
							}
							return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
						}

						throw new TypeError('val must be string, number or Buffer')
					}

					function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
						var indexSize = 1
						var arrLength = arr.length
						var valLength = val.length

						if (encoding !== undefined) {
							encoding = String(encoding).toLowerCase()
							if (encoding === 'ucs2' || encoding === 'ucs-2' ||
								encoding === 'utf16le' || encoding === 'utf-16le') {
								if (arr.length < 2 || val.length < 2) {
									return -1
								}
								indexSize = 2
								arrLength /= 2
								valLength /= 2
								byteOffset /= 2
							}
						}

						function read(buf, i) {
							if (indexSize === 1) {
								return buf[i]
							} else {
								return buf.readUInt16BE(i * indexSize)
							}
						}

						var i
						if (dir) {
							var foundIndex = -1
							for (i = byteOffset; i < arrLength; i++) {
								if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
									if (foundIndex === -1) foundIndex = i
									if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
								} else {
									if (foundIndex !== -1) i -= i - foundIndex
									foundIndex = -1
								}
							}
						} else {
							if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
							for (i = byteOffset; i >= 0; i--) {
								var found = true
								for (var j = 0; j < valLength; j++) {
									if (read(arr, i + j) !== read(val, j)) {
										found = false
										break
									}
								}
								if (found) return i
							}
						}

						return -1
					}

					Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
						return this.indexOf(val, byteOffset, encoding) !== -1
					}

					Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
						return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
					}

					Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
						return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
					}

					function hexWrite(buf, string, offset, length) {
						offset = Number(offset) || 0
						var remaining = buf.length - offset
						if (!length) {
							length = remaining
						} else {
							length = Number(length)
							if (length > remaining) {
								length = remaining
							}
						}

						var strLen = string.length
						if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

						if (length > strLen / 2) {
							length = strLen / 2
						}
						for (var i = 0; i < length; ++i) {
							var parsed = parseInt(string.substr(i * 2, 2), 16)
							if (isNaN(parsed)) return i
							buf[offset + i] = parsed
						}
						return i
					}

					function utf8Write(buf, string, offset, length) {
						return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
					}

					function asciiWrite(buf, string, offset, length) {
						return blitBuffer(asciiToBytes(string), buf, offset, length)
					}

					function latin1Write(buf, string, offset, length) {
						return asciiWrite(buf, string, offset, length)
					}

					function base64Write(buf, string, offset, length) {
						return blitBuffer(base64ToBytes(string), buf, offset, length)
					}

					function ucs2Write(buf, string, offset, length) {
						return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
					}

					Buffer.prototype.write = function write(string, offset, length, encoding) {
						if (offset === undefined) {
							encoding = 'utf8'
							length = this.length
							offset = 0
						} else if (length === undefined && typeof offset === 'string') {
							encoding = offset
							length = this.length
							offset = 0
						} else if (isFinite(offset)) {
							offset = offset | 0
							if (isFinite(length)) {
								length = length | 0
								if (encoding === undefined) encoding = 'utf8'
							} else {
								encoding = length
								length = undefined
							}
						} else {
							throw new Error(
								'Buffer.write(string, encoding, offset[, length]) is no longer supported'
							)
						}

						var remaining = this.length - offset
						if (length === undefined || length > remaining) length = remaining

						if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
							throw new RangeError('Attempt to write outside buffer bounds')
						}

						if (!encoding) encoding = 'utf8'

						var loweredCase = false
						for (;;) {
							switch (encoding) {
								case 'hex':
									return hexWrite(this, string, offset, length)

								case 'utf8':
								case 'utf-8':
									return utf8Write(this, string, offset, length)

								case 'ascii':
									return asciiWrite(this, string, offset, length)

								case 'latin1':
								case 'binary':
									return latin1Write(this, string, offset, length)

								case 'base64':
									return base64Write(this, string, offset, length)

								case 'ucs2':
								case 'ucs-2':
								case 'utf16le':
								case 'utf-16le':
									return ucs2Write(this, string, offset, length)

								default:
									if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
									encoding = ('' + encoding).toLowerCase()
									loweredCase = true
							}
						}
					}

					Buffer.prototype.toJSON = function toJSON() {
						return {
							type: 'Buffer',
							data: Array.prototype.slice.call(this._arr || this, 0)
						}
					}

					function base64Slice(buf, start, end) {
						if (start === 0 && end === buf.length) {
							return base64.fromByteArray(buf)
						} else {
							return base64.fromByteArray(buf.slice(start, end))
						}
					}

					function utf8Slice(buf, start, end) {
						end = Math.min(buf.length, end)
						var res = []

						var i = start
						while (i < end) {
							var firstByte = buf[i]
							var codePoint = null
							var bytesPerSequence = (firstByte > 0xEF) ? 4 :
								(firstByte > 0xDF) ? 3 :
								(firstByte > 0xBF) ? 2 :
								1

							if (i + bytesPerSequence <= end) {
								var secondByte, thirdByte, fourthByte, tempCodePoint

								switch (bytesPerSequence) {
									case 1:
										if (firstByte < 0x80) {
											codePoint = firstByte
										}
										break
									case 2:
										secondByte = buf[i + 1]
										if ((secondByte & 0xC0) === 0x80) {
											tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
											if (tempCodePoint > 0x7F) {
												codePoint = tempCodePoint
											}
										}
										break
									case 3:
										secondByte = buf[i + 1]
										thirdByte = buf[i + 2]
										if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
											tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
											if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
												codePoint = tempCodePoint
											}
										}
										break
									case 4:
										secondByte = buf[i + 1]
										thirdByte = buf[i + 2]
										fourthByte = buf[i + 3]
										if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
											tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
											if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
												codePoint = tempCodePoint
											}
										}
								}
							}

							if (codePoint === null) {
								codePoint = 0xFFFD
								bytesPerSequence = 1
							} else if (codePoint > 0xFFFF) {
								codePoint -= 0x10000
								res.push(codePoint >>> 10 & 0x3FF | 0xD800)
								codePoint = 0xDC00 | codePoint & 0x3FF
							}
							res.push(codePoint)
							i += bytesPerSequence
						}
						return decodeCodePointsArray(res)
					}

					var MAX_ARGUMENTS_LENGTH = 0x1000

					function decodeCodePointsArray(codePoints) {
						var len = codePoints.length
						if (len <= MAX_ARGUMENTS_LENGTH) {
							return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
						}

						var res = ''
						var i = 0
						while (i < len) {
							res += String.fromCharCode.apply(
								String,
								codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
							)
						}
						return res
					}

					function asciiSlice(buf, start, end) {
						var ret = ''
						end = Math.min(buf.length, end)

						for (var i = start; i < end; ++i) {
							ret += String.fromCharCode(buf[i] & 0x7F)
						}
						return ret
					}

					function latin1Slice(buf, start, end) {
						var ret = ''
						end = Math.min(buf.length, end)

						for (var i = start; i < end; ++i) {
							ret += String.fromCharCode(buf[i])
						}
						return ret
					}

					function hexSlice(buf, start, end) {
						var len = buf.length

						if (!start || start < 0) start = 0
						if (!end || end < 0 || end > len) end = len

						var out = ''
						for (var i = start; i < end; ++i) {
							out += toHex(buf[i])
						}
						return out
					}

					function utf16leSlice(buf, start, end) {
						var bytes = buf.slice(start, end)
						var res = ''
						for (var i = 0; i < bytes.length; i += 2) {
							res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
						}
						return res
					}

					Buffer.prototype.slice = function slice(start, end) {
						var len = this.length
						start = ~~start
						end = end === undefined ? len : ~~end

						if (start < 0) {
							start += len
							if (start < 0) start = 0
						} else if (start > len) {
							start = len
						}

						if (end < 0) {
							end += len
							if (end < 0) end = 0
						} else if (end > len) {
							end = len
						}

						if (end < start) end = start

						var newBuf
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							newBuf = this.subarray(start, end)
							newBuf.__proto__ = Buffer.prototype
						} else {
							var sliceLen = end - start
							newBuf = new Buffer(sliceLen, undefined)
							for (var i = 0; i < sliceLen; ++i) {
								newBuf[i] = this[i + start]
							}
						}

						return newBuf
					}

					function checkOffset(offset, ext, length) {
						if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
						if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
					}

					Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
						offset = offset | 0
						byteLength = byteLength | 0
						if (!noAssert) checkOffset(offset, byteLength, this.length)

						var val = this[offset]
						var mul = 1
						var i = 0
						while (++i < byteLength && (mul *= 0x100)) {
							val += this[offset + i] * mul
						}

						return val
					}

					Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
						offset = offset | 0
						byteLength = byteLength | 0
						if (!noAssert) {
							checkOffset(offset, byteLength, this.length)
						}

						var val = this[offset + --byteLength]
						var mul = 1
						while (byteLength > 0 && (mul *= 0x100)) {
							val += this[offset + --byteLength] * mul
						}

						return val
					}

					Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 1, this.length)
						return this[offset]
					}

					Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 2, this.length)
						return this[offset] | (this[offset + 1] << 8)
					}

					Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 2, this.length)
						return (this[offset] << 8) | this[offset + 1]
					}

					Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 4, this.length)

						return ((this[offset]) |
								(this[offset + 1] << 8) |
								(this[offset + 2] << 16)) +
							(this[offset + 3] * 0x1000000)
					}

					Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 4, this.length)

						return (this[offset] * 0x1000000) +
							((this[offset + 1] << 16) |
								(this[offset + 2] << 8) |
								this[offset + 3])
					}

					Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
						offset = offset | 0
						byteLength = byteLength | 0
						if (!noAssert) checkOffset(offset, byteLength, this.length)

						var val = this[offset]
						var mul = 1
						var i = 0
						while (++i < byteLength && (mul *= 0x100)) {
							val += this[offset + i] * mul
						}
						mul *= 0x80

						if (val >= mul) val -= Math.pow(2, 8 * byteLength)

						return val
					}

					Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
						offset = offset | 0
						byteLength = byteLength | 0
						if (!noAssert) checkOffset(offset, byteLength, this.length)

						var i = byteLength
						var mul = 1
						var val = this[offset + --i]
						while (i > 0 && (mul *= 0x100)) {
							val += this[offset + --i] * mul
						}
						mul *= 0x80

						if (val >= mul) val -= Math.pow(2, 8 * byteLength)

						return val
					}

					Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 1, this.length)
						if (!(this[offset] & 0x80)) return (this[offset])
						return ((0xff - this[offset] + 1) * -1)
					}

					Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 2, this.length)
						var val = this[offset] | (this[offset + 1] << 8)
						return (val & 0x8000) ? val | 0xFFFF0000 : val
					}

					Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 2, this.length)
						var val = this[offset + 1] | (this[offset] << 8)
						return (val & 0x8000) ? val | 0xFFFF0000 : val
					}

					Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 4, this.length)

						return (this[offset]) |
							(this[offset + 1] << 8) |
							(this[offset + 2] << 16) |
							(this[offset + 3] << 24)
					}

					Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 4, this.length)

						return (this[offset] << 24) |
							(this[offset + 1] << 16) |
							(this[offset + 2] << 8) |
							(this[offset + 3])
					}

					Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 4, this.length)
						return ieee754.read(this, offset, true, 23, 4)
					}

					Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 4, this.length)
						return ieee754.read(this, offset, false, 23, 4)
					}

					Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 8, this.length)
						return ieee754.read(this, offset, true, 52, 8)
					}

					Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
						if (!noAssert) checkOffset(offset, 8, this.length)
						return ieee754.read(this, offset, false, 52, 8)
					}

					function checkInt(buf, value, offset, ext, max, min) {
						if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
						if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
						if (offset + ext > buf.length) throw new RangeError('Index out of range')
					}

					Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
						value = +value
						offset = offset | 0
						byteLength = byteLength | 0
						if (!noAssert) {
							var maxBytes = Math.pow(2, 8 * byteLength) - 1
							checkInt(this, value, offset, byteLength, maxBytes, 0)
						}

						var mul = 1
						var i = 0
						this[offset] = value & 0xFF
						while (++i < byteLength && (mul *= 0x100)) {
							this[offset + i] = (value / mul) & 0xFF
						}

						return offset + byteLength
					}

					Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
						value = +value
						offset = offset | 0
						byteLength = byteLength | 0
						if (!noAssert) {
							var maxBytes = Math.pow(2, 8 * byteLength) - 1
							checkInt(this, value, offset, byteLength, maxBytes, 0)
						}

						var i = byteLength - 1
						var mul = 1
						this[offset + i] = value & 0xFF
						while (--i >= 0 && (mul *= 0x100)) {
							this[offset + i] = (value / mul) & 0xFF
						}

						return offset + byteLength
					}

					Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
						if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
						this[offset] = (value & 0xff)
						return offset + 1
					}

					function objectWriteUInt16(buf, value, offset, littleEndian) {
						if (value < 0) value = 0xffff + value + 1
						for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
							buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
								(littleEndian ? i : 1 - i) * 8
						}
					}

					Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							this[offset] = (value & 0xff)
							this[offset + 1] = (value >>> 8)
						} else {
							objectWriteUInt16(this, value, offset, true)
						}
						return offset + 2
					}

					Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							this[offset] = (value >>> 8)
							this[offset + 1] = (value & 0xff)
						} else {
							objectWriteUInt16(this, value, offset, false)
						}
						return offset + 2
					}

					function objectWriteUInt32(buf, value, offset, littleEndian) {
						if (value < 0) value = 0xffffffff + value + 1
						for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
							buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
						}
					}

					Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							this[offset + 3] = (value >>> 24)
							this[offset + 2] = (value >>> 16)
							this[offset + 1] = (value >>> 8)
							this[offset] = (value & 0xff)
						} else {
							objectWriteUInt32(this, value, offset, true)
						}
						return offset + 4
					}

					Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							this[offset] = (value >>> 24)
							this[offset + 1] = (value >>> 16)
							this[offset + 2] = (value >>> 8)
							this[offset + 3] = (value & 0xff)
						} else {
							objectWriteUInt32(this, value, offset, false)
						}
						return offset + 4
					}

					Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) {
							var limit = Math.pow(2, 8 * byteLength - 1)

							checkInt(this, value, offset, byteLength, limit - 1, -limit)
						}

						var i = 0
						var mul = 1
						var sub = 0
						this[offset] = value & 0xFF
						while (++i < byteLength && (mul *= 0x100)) {
							if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
								sub = 1
							}
							this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
						}

						return offset + byteLength
					}

					Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) {
							var limit = Math.pow(2, 8 * byteLength - 1)

							checkInt(this, value, offset, byteLength, limit - 1, -limit)
						}

						var i = byteLength - 1
						var mul = 1
						var sub = 0
						this[offset + i] = value & 0xFF
						while (--i >= 0 && (mul *= 0x100)) {
							if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
								sub = 1
							}
							this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
						}

						return offset + byteLength
					}

					Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
						if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
						if (value < 0) value = 0xff + value + 1
						this[offset] = (value & 0xff)
						return offset + 1
					}

					Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							this[offset] = (value & 0xff)
							this[offset + 1] = (value >>> 8)
						} else {
							objectWriteUInt16(this, value, offset, true)
						}
						return offset + 2
					}

					Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							this[offset] = (value >>> 8)
							this[offset + 1] = (value & 0xff)
						} else {
							objectWriteUInt16(this, value, offset, false)
						}
						return offset + 2
					}

					Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							this[offset] = (value & 0xff)
							this[offset + 1] = (value >>> 8)
							this[offset + 2] = (value >>> 16)
							this[offset + 3] = (value >>> 24)
						} else {
							objectWriteUInt32(this, value, offset, true)
						}
						return offset + 4
					}

					Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
						value = +value
						offset = offset | 0
						if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
						if (value < 0) value = 0xffffffff + value + 1
						if (Buffer.TYPED_ARRAY_SUPPORT) {
							this[offset] = (value >>> 24)
							this[offset + 1] = (value >>> 16)
							this[offset + 2] = (value >>> 8)
							this[offset + 3] = (value & 0xff)
						} else {
							objectWriteUInt32(this, value, offset, false)
						}
						return offset + 4
					}

					function checkIEEE754(buf, value, offset, ext, max, min) {
						if (offset + ext > buf.length) throw new RangeError('Index out of range')
						if (offset < 0) throw new RangeError('Index out of range')
					}

					function writeFloat(buf, value, offset, littleEndian, noAssert) {
						if (!noAssert) {
							checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
						}
						ieee754.write(buf, value, offset, littleEndian, 23, 4)
						return offset + 4
					}

					Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
						return writeFloat(this, value, offset, true, noAssert)
					}

					Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
						return writeFloat(this, value, offset, false, noAssert)
					}

					function writeDouble(buf, value, offset, littleEndian, noAssert) {
						if (!noAssert) {
							checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
						}
						ieee754.write(buf, value, offset, littleEndian, 52, 8)
						return offset + 8
					}

					Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
						return writeDouble(this, value, offset, true, noAssert)
					}

					Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
						return writeDouble(this, value, offset, false, noAssert)
					}

					Buffer.prototype.copy = function copy(target, targetStart, start, end) {
						if (!start) start = 0
						if (!end && end !== 0) end = this.length
						if (targetStart >= target.length) targetStart = target.length
						if (!targetStart) targetStart = 0
						if (end > 0 && end < start) end = start

						if (end === start) return 0
						if (target.length === 0 || this.length === 0) return 0

						if (targetStart < 0) {
							throw new RangeError('targetStart out of bounds')
						}
						if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
						if (end < 0) throw new RangeError('sourceEnd out of bounds')

						if (end > this.length) end = this.length
						if (target.length - targetStart < end - start) {
							end = target.length - targetStart + start
						}

						var len = end - start
						var i

						if (this === target && start < targetStart && targetStart < end) {
							for (i = len - 1; i >= 0; --i) {
								target[i + targetStart] = this[i + start]
							}
						} else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
							for (i = 0; i < len; ++i) {
								target[i + targetStart] = this[i + start]
							}
						} else {
							Uint8Array.prototype.set.call(
								target,
								this.subarray(start, start + len),
								targetStart
							)
						}

						return len
					}
					Buffer.prototype.fill = function fill(val, start, end, encoding) {
						if (typeof val === 'string') {
							if (typeof start === 'string') {
								encoding = start
								start = 0
								end = this.length
							} else if (typeof end === 'string') {
								encoding = end
								end = this.length
							}
							if (val.length === 1) {
								var code = val.charCodeAt(0)
								if (code < 256) {
									val = code
								}
							}
							if (encoding !== undefined && typeof encoding !== 'string') {
								throw new TypeError('encoding must be a string')
							}
							if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
								throw new TypeError('Unknown encoding: ' + encoding)
							}
						} else if (typeof val === 'number') {
							val = val & 255
						}

						if (start < 0 || this.length < start || this.length < end) {
							throw new RangeError('Out of range index')
						}

						if (end <= start) {
							return this
						}

						start = start >>> 0
						end = end === undefined ? this.length : end >>> 0

						if (!val) val = 0

						var i
						if (typeof val === 'number') {
							for (i = start; i < end; ++i) {
								this[i] = val
							}
						} else {
							var bytes = Buffer.isBuffer(val) ?
								val :
								utf8ToBytes(new Buffer(val, encoding).toString())
							var len = bytes.length
							for (i = 0; i < end - start; ++i) {
								this[i + start] = bytes[i % len]
							}
						}

						return this
					}

					var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

					function base64clean(str) {
						str = stringtrim(str).replace(INVALID_BASE64_RE, '')
						if (str.length < 2) return ''
						while (str.length % 4 !== 0) {
							str = str + '='
						}
						return str
					}

					function stringtrim(str) {
						if (str.trim) return str.trim()
						return str.replace(/^\s+|\s+$/g, '')
					}

					function toHex(n) {
						if (n < 16) return '0' + n.toString(16)
						return n.toString(16)
					}

					function utf8ToBytes(string, units) {
						units = units || Infinity
						var codePoint
						var length = string.length
						var leadSurrogate = null
						var bytes = []

						for (var i = 0; i < length; ++i) {
							codePoint = string.charCodeAt(i)
							if (codePoint > 0xD7FF && codePoint < 0xE000) {
								if (!leadSurrogate) {
									if (codePoint > 0xDBFF) {
										if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
										continue
									} else if (i + 1 === length) {
										if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
										continue
									}
									leadSurrogate = codePoint
									continue
								}

								if (codePoint < 0xDC00) {
									if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
									leadSurrogate = codePoint
									continue
								}
								codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
							} else if (leadSurrogate) {
								if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
							}
							leadSurrogate = null
							if (codePoint < 0x80) {
								if ((units -= 1) < 0) break
								bytes.push(codePoint)
							} else if (codePoint < 0x800) {
								if ((units -= 2) < 0) break
								bytes.push(
									codePoint >> 0x6 | 0xC0,
									codePoint & 0x3F | 0x80
								)
							} else if (codePoint < 0x10000) {
								if ((units -= 3) < 0) break
								bytes.push(
									codePoint >> 0xC | 0xE0,
									codePoint >> 0x6 & 0x3F | 0x80,
									codePoint & 0x3F | 0x80
								)
							} else if (codePoint < 0x110000) {
								if ((units -= 4) < 0) break
								bytes.push(
									codePoint >> 0x12 | 0xF0,
									codePoint >> 0xC & 0x3F | 0x80,
									codePoint >> 0x6 & 0x3F | 0x80,
									codePoint & 0x3F | 0x80
								)
							} else {
								throw new Error('Invalid code point')
							}
						}
						return bytes
					}

					function asciiToBytes(str) {
						var byteArray = []
						for (var i = 0; i < str.length; ++i) {
							byteArray.push(str.charCodeAt(i) & 0xFF)
						}
						return byteArray
					}

					function utf16leToBytes(str, units) {
						var c, hi, lo
						var byteArray = []
						for (var i = 0; i < str.length; ++i) {
							if ((units -= 2) < 0) break

							c = str.charCodeAt(i)
							hi = c >> 8
							lo = c % 256
							byteArray.push(lo)
							byteArray.push(hi)
						}
						return byteArray
					}

					function base64ToBytes(str) {
						return base64.toByteArray(base64clean(str))
					}

					function blitBuffer(src, dst, offset, length) {
						for (var i = 0; i < length; ++i) {
							if ((i + offset >= dst.length) || (i >= src.length)) break
							dst[i + offset] = src[i]
						}
						return i
					}

					function isnan(val) {
						return val !== val // eslint-disable-line no-self-compare
					}

				}.call(exports, __webpack_require__(4)))
			}),
			(function (module, exports, __webpack_require__) {

				exports.UINT32 = __webpack_require__(8)
				exports.UINT64 = __webpack_require__(9)
			}),
			(function (module, exports, __webpack_require__) {

				module.exports = {
					h32: __webpack_require__(3),
					h64: __webpack_require__(10)
				}
			}),
			(function (module, exports, __webpack_require__) {

				/* WEBPACK VAR INJECTION */
				(function (Buffer) {
					var UINT32 = __webpack_require__(1).UINT32
					UINT32.prototype.xxh_update = function (low, high) {
						var b00 = PRIME32_2._low
						var b16 = PRIME32_2._high

						var c16, c00
						c00 = low * b00
						c16 = c00 >>> 16

						c16 += high * b00
						c16 &= 0xFFFF
						c16 += low * b16

						var a00 = this._low + (c00 & 0xFFFF)
						var a16 = a00 >>> 16

						a16 += this._high + (c16 & 0xFFFF)

						var v = (a16 << 16) | (a00 & 0xFFFF)
						v = (v << 13) | (v >>> 19)

						a00 = v & 0xFFFF
						a16 = v >>> 16

						b00 = PRIME32_1._low
						b16 = PRIME32_1._high

						c00 = a00 * b00
						c16 = c00 >>> 16

						c16 += a16 * b00
						c16 &= 0xFFFF
						c16 += a00 * b16

						this._low = c00 & 0xFFFF
						this._high = c16 & 0xFFFF
					}

					//Constants
					var PRIME32_1 = UINT32('2654435761')
					var PRIME32_2 = UINT32('2246822519')
					var PRIME32_3 = UINT32('3266489917')
					var PRIME32_4 = UINT32('668265263')
					var PRIME32_5 = UINT32('374761393')

					/**
					 * Convert string to proper UTF-8 array
					 * @param str Input string
					 * @returns {Uint8Array} UTF8 array is returned as uint8 array
					 */
					function toUTF8Array(str) {
						var utf8 = []
						for (var i = 0, n = str.length; i < n; i++) {
							var charcode = str.charCodeAt(i)
							if (charcode < 0x80) utf8.push(charcode)
							else if (charcode < 0x800) {
								utf8.push(0xc0 | (charcode >> 6),
									0x80 | (charcode & 0x3f))
							} else if (charcode < 0xd800 || charcode >= 0xe000) {
								utf8.push(0xe0 | (charcode >> 12),
									0x80 | ((charcode >> 6) & 0x3f),
									0x80 | (charcode & 0x3f))
							} else {
								i++;
								charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
									(str.charCodeAt(i) & 0x3ff))
								utf8.push(0xf0 | (charcode >> 18),
									0x80 | ((charcode >> 12) & 0x3f),
									0x80 | ((charcode >> 6) & 0x3f),
									0x80 | (charcode & 0x3f))
							}
						}
						return new Uint8Array(utf8)
					}

					/**
					 * XXH object used as a constructor or a function
					 * @constructor
					 * or
					 * @param {Object|String} input data
					 * @param {Number|UINT32} seed
					 * @return ThisExpression
					 * or
					 * @return {UINT32} xxHash
					 */
					function XXH() {
						if (arguments.length == 2)
							return new XXH(arguments[1]).update(arguments[0]).digest()

						if (!(this instanceof XXH))
							return new XXH(arguments[0])

						init.call(this, arguments[0])
					}

					/**
					 * Initialize the XXH instance with the given seed
					 * @method init
					 * @param {Number|Object} seed as a number or an unsigned 32 bits integer
					 * @return ThisExpression
					 */
					function init(seed) {
						this.seed = seed instanceof UINT32 ? seed.clone() : UINT32(seed)
						this.v1 = this.seed.clone().add(PRIME32_1).add(PRIME32_2)
						this.v2 = this.seed.clone().add(PRIME32_2)
						this.v3 = this.seed.clone()
						this.v4 = this.seed.clone().subtract(PRIME32_1)
						this.total_len = 0
						this.memsize = 0
						this.memory = null

						return this
					}
					XXH.prototype.init = init

					/**
					 * Add data to be computed for the XXH hash
					 * @method update
					 * @param {String|Buffer|ArrayBuffer} input as a string or nodejs Buffer or ArrayBuffer
					 * @return ThisExpression
					 */
					XXH.prototype.update = function (input) {
						var isString = typeof input == 'string'
						var isArrayBuffer

						// Convert all strings to utf-8 first (issue #5)
						if (isString) {
							input = toUTF8Array(input)
							isString = false
							isArrayBuffer = true
						}

						if (typeof ArrayBuffer !== "undefined" && input instanceof ArrayBuffer) {
							isArrayBuffer = true
							input = new Uint8Array(input);
						}

						var p = 0
						var len = input.length
						var bEnd = p + len

						if (len == 0) return this

						this.total_len += len

						if (this.memsize == 0) {
							if (isString) {
								this.memory = ''
							} else if (isArrayBuffer) {
								this.memory = new Uint8Array(16)
							} else {
								this.memory = new Buffer(16)
							}
						}

						if (this.memsize + len < 16) {
							if (isString) {
								this.memory += input
							} else if (isArrayBuffer) {
								this.memory.set(input.subarray(0, len), this.memsize)
							} else {
								input.copy(this.memory, this.memsize, 0, len)
							}

							this.memsize += len
							return this
						}

						if (this.memsize > 0) {
							if (isString) {
								this.memory += input.slice(0, 16 - this.memsize)
							} else if (isArrayBuffer) {
								this.memory.set(input.subarray(0, 16 - this.memsize), this.memsize)
							} else {
								input.copy(this.memory, this.memsize, 0, 16 - this.memsize)
							}

							var p32 = 0
							if (isString) {
								this.v1.xxh_update(
									(this.memory.charCodeAt(p32 + 1) << 8) | this.memory.charCodeAt(p32), (this.memory.charCodeAt(p32 + 3) << 8) | this.memory.charCodeAt(p32 + 2)
								)
								p32 += 4
								this.v2.xxh_update(
									(this.memory.charCodeAt(p32 + 1) << 8) | this.memory.charCodeAt(p32), (this.memory.charCodeAt(p32 + 3) << 8) | this.memory.charCodeAt(p32 + 2)
								)
								p32 += 4
								this.v3.xxh_update(
									(this.memory.charCodeAt(p32 + 1) << 8) | this.memory.charCodeAt(p32), (this.memory.charCodeAt(p32 + 3) << 8) | this.memory.charCodeAt(p32 + 2)
								)
								p32 += 4
								this.v4.xxh_update(
									(this.memory.charCodeAt(p32 + 1) << 8) | this.memory.charCodeAt(p32), (this.memory.charCodeAt(p32 + 3) << 8) | this.memory.charCodeAt(p32 + 2)
								)
							} else {
								this.v1.xxh_update(
									(this.memory[p32 + 1] << 8) | this.memory[p32], (this.memory[p32 + 3] << 8) | this.memory[p32 + 2]
								)
								p32 += 4
								this.v2.xxh_update(
									(this.memory[p32 + 1] << 8) | this.memory[p32], (this.memory[p32 + 3] << 8) | this.memory[p32 + 2]
								)
								p32 += 4
								this.v3.xxh_update(
									(this.memory[p32 + 1] << 8) | this.memory[p32], (this.memory[p32 + 3] << 8) | this.memory[p32 + 2]
								)
								p32 += 4
								this.v4.xxh_update(
									(this.memory[p32 + 1] << 8) | this.memory[p32], (this.memory[p32 + 3] << 8) | this.memory[p32 + 2]
								)
							}

							p += 16 - this.memsize
							this.memsize = 0
							if (isString) this.memory = ''
						}

						if (p <= bEnd - 16) {
							var limit = bEnd - 16

							do {
								if (isString) {
									this.v1.xxh_update(
										(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2)
									)
									p += 4
									this.v2.xxh_update(
										(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2)
									)
									p += 4
									this.v3.xxh_update(
										(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2)
									)
									p += 4
									this.v4.xxh_update(
										(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2)
									)
								} else {
									this.v1.xxh_update(
										(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2]
									)
									p += 4
									this.v2.xxh_update(
										(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2]
									)
									p += 4
									this.v3.xxh_update(
										(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2]
									)
									p += 4
									this.v4.xxh_update(
										(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2]
									)
								}
								p += 4
							} while (p <= limit)
						}

						if (p < bEnd) {
							// XXH_memcpy(this.memory, p, bEnd-p);
							if (isString) {
								this.memory += input.slice(p)
							} else if (isArrayBuffer) {
								this.memory.set(input.subarray(p, bEnd), this.memsize)
							} else {
								input.copy(this.memory, this.memsize, p, bEnd)
							}

							this.memsize = bEnd - p
						}

						return this
					}

					/**
					 * Finalize the XXH computation. The XXH instance is ready for reuse for the given seed
					 * @method digest
					 * @return {UINT32} xxHash
					 */
					XXH.prototype.digest = function () {
						var input = this.memory
						var isString = typeof input == 'string'
						var p = 0
						var bEnd = this.memsize
						var h32, h
						var u = new UINT32

						if (this.total_len >= 16) {
							h32 = this.v1.rotl(1).add(this.v2.rotl(7).add(this.v3.rotl(12).add(this.v4.rotl(18))))
						} else {
							h32 = this.seed.clone().add(PRIME32_5)
						}

						h32.add(u.fromNumber(this.total_len))

						while (p <= bEnd - 4) {
							if (isString) {
								u.fromBits(
									(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2)
								)
							} else {
								u.fromBits(
									(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2]
								)
							}
							h32
								.add(u.multiply(PRIME32_3))
								.rotl(17)
								.multiply(PRIME32_4)
							p += 4
						}

						while (p < bEnd) {
							u.fromBits(isString ? input.charCodeAt(p++) : input[p++], 0)
							h32
								.add(u.multiply(PRIME32_5))
								.rotl(11)
								.multiply(PRIME32_1)
						}

						h = h32.clone().shiftRight(15)
						h32.xor(h).multiply(PRIME32_2)

						h = h32.clone().shiftRight(13)
						h32.xor(h).multiply(PRIME32_3)

						h = h32.clone().shiftRight(16)
						h32.xor(h)

						this.init(this.seed)

						return h32
					}

					module.exports = XXH

					/* WEBPACK VAR INJECTION */
				}.call(exports, __webpack_require__(0).Buffer))
			}),
			(function (module, exports) {

				var g;

				g = (function () {
					return this;
				})();

				try {
					g = g || Function("return this")() || (1, eval)("this");
				} catch (e) {
					if (typeof window === "object")
						g = window;
				}
				module.exports = g;
			}),
			(function (module, exports, __webpack_require__) {

				exports.byteLength = byteLength
				exports.toByteArray = toByteArray
				exports.fromByteArray = fromByteArray

				var lookup = []
				var revLookup = []
				var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

				var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
				for (var i = 0, len = code.length; i < len; ++i) {
					lookup[i] = code[i]
					revLookup[code.charCodeAt(i)] = i
				}

				revLookup['-'.charCodeAt(0)] = 62
				revLookup['_'.charCodeAt(0)] = 63

				function placeHoldersCount(b64) {
					var len = b64.length
					if (len % 4 > 0) {
						throw new Error('Invalid string. Length must be a multiple of 4')
					}
					return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
				}

				function byteLength(b64) {
					return (b64.length * 3 / 4) - placeHoldersCount(b64)
				}

				function toByteArray(b64) {
					var i, l, tmp, placeHolders, arr
					var len = b64.length
					placeHolders = placeHoldersCount(b64)

					arr = new Arr((len * 3 / 4) - placeHolders)
					l = placeHolders > 0 ? len - 4 : len
					var L = 0
					for (i = 0; i < l; i += 4) {
						tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
						arr[L++] = (tmp >> 16) & 0xFF
						arr[L++] = (tmp >> 8) & 0xFF
						arr[L++] = tmp & 0xFF
					}

					if (placeHolders === 2) {
						tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
						arr[L++] = tmp & 0xFF
					} else if (placeHolders === 1) {
						tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
						arr[L++] = (tmp >> 8) & 0xFF
						arr[L++] = tmp & 0xFF
					}
					return arr
				}

				function tripletToBase64(num) {
					return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
				}

				function encodeChunk(uint8, start, end) {
					var tmp
					var output = []
					for (var i = start; i < end; i += 3) {
						tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
						output.push(tripletToBase64(tmp))
					}
					return output.join('')
				}

				function fromByteArray(uint8) {
					var tmp
					var len = uint8.length
					var extraBytes = len % 3
					var output = ''
					var parts = []
					var maxChunkLength = 16383
					for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
						parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
					}
					if (extraBytes === 1) {
						tmp = uint8[len - 1]
						output += lookup[tmp >> 2]
						output += lookup[(tmp << 4) & 0x3F]
						output += '=='
					} else if (extraBytes === 2) {
						tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
						output += lookup[tmp >> 10]
						output += lookup[(tmp >> 4) & 0x3F]
						output += lookup[(tmp << 2) & 0x3F]
						output += '='
					}
					parts.push(output)
					return parts.join('')
				}
			}),
			(function (module, exports) {
				exports.read = function (buffer, offset, isLE, mLen, nBytes) {
					var e, m
					var eLen = nBytes * 8 - mLen - 1
					var eMax = (1 << eLen) - 1
					var eBias = eMax >> 1
					var nBits = -7
					var i = isLE ? (nBytes - 1) : 0
					var d = isLE ? -1 : 1
					var s = buffer[offset + i]

					i += d

					e = s & ((1 << (-nBits)) - 1)
					s >>= (-nBits)
					nBits += eLen
					for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

					m = e & ((1 << (-nBits)) - 1)
					e >>= (-nBits)
					nBits += mLen
					for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

					if (e === 0) {
						e = 1 - eBias
					} else if (e === eMax) {
						return m ? NaN : ((s ? -1 : 1) * Infinity)
					} else {
						m = m + Math.pow(2, mLen)
						e = e - eBias
					}
					return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
				}

				exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
					var e, m, c
					var eLen = nBytes * 8 - mLen - 1
					var eMax = (1 << eLen) - 1
					var eBias = eMax >> 1
					var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
					var i = isLE ? 0 : (nBytes - 1)
					var d = isLE ? 1 : -1
					var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

					value = Math.abs(value)

					if (isNaN(value) || value === Infinity) {
						m = isNaN(value) ? 1 : 0
						e = eMax
					} else {
						e = Math.floor(Math.log(value) / Math.LN2)
						if (value * (c = Math.pow(2, -e)) < 1) {
							e--
							c *= 2
						}
						if (e + eBias >= 1) {
							value += rt / c
						} else {
							value += rt * Math.pow(2, 1 - eBias)
						}
						if (value * c >= 2) {
							e++
							c /= 2
						}

						if (e + eBias >= eMax) {
							m = 0
							e = eMax
						} else if (e + eBias >= 1) {
							m = (value * c - 1) * Math.pow(2, mLen)
							e = e + eBias
						} else {
							m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
							e = 0
						}
					}

					for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

					e = (e << mLen) | m
					eLen += mLen
					for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

					buffer[offset + i - d] |= s * 128
				}
			}),
			(function (module, exports) {
				var toString = {}.toString;
				module.exports = Array.isArray || function (arr) {
					return toString.call(arr) == '[object Array]';
				};
			}),
			(function (module, exports, __webpack_require__) {
				var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
				(function (root) {
					var radixPowerCache = {
						36: UINT32(Math.pow(36, 5)),
						16: UINT32(Math.pow(16, 7)),
						10: UINT32(Math.pow(10, 9)),
						2: UINT32(Math.pow(2, 30))
					}
					var radixCache = {
						36: UINT32(36),
						16: UINT32(16),
						10: UINT32(10),
						2: UINT32(2)
					}
					/**
					 *	Represents an unsigned 32 bits integer
					 * @constructor
					 * @param {Number|String|Number} low bits     | integer as a string 		 | integer as a number
					 * @param {Number|Number|Undefined} high bits | radix (optional, default=10)
					 * @return 
					 */
					function UINT32(l, h) {
						if (!(this instanceof UINT32))
							return new UINT32(l, h)

						this._low = 0
						this._high = 0
						this.remainder = null
						if (typeof h == 'undefined')
							return fromNumber.call(this, l)

						if (typeof l == 'string')
							return fromString.call(this, l, h)

						fromBits.call(this, l, h)
					}

					/**
					 * Set the current _UINT32_ object with its low and high bits
					 * @method fromBits
					 * @param {Number} low bits
					 * @param {Number} high bits
					 * @return ThisExpression
					 */
					function fromBits(l, h) {
						this._low = l | 0
						this._high = h | 0

						return this
					}
					UINT32.prototype.fromBits = fromBits

					/**
					 * Set the current _UINT32_ object from a number
					 * @method fromNumber
					 * @param {Number} number
					 * @return ThisExpression
					 */
					function fromNumber(value) {
						this._low = value & 0xFFFF
						this._high = value >>> 16

						return this
					}
					UINT32.prototype.fromNumber = fromNumber

					/**
					 * Set the current _UINT32_ object from a string
					 * @method fromString
					 * @param {String} integer as a string
					 * @param {Number} radix (optional, default=10)
					 * @return ThisExpression
					 */
					function fromString(s, radix) {
						var value = parseInt(s, radix || 10)

						this._low = value & 0xFFFF
						this._high = value >>> 16

						return this
					}
					UINT32.prototype.fromString = fromString

					/**
					 * Convert this _UINT32_ to a number
					 * @method toNumber
					 * @return {Number} the converted UINT32
					 */
					UINT32.prototype.toNumber = function () {
						return (this._high * 65536) + this._low
					}

					/**
					 * Convert this _UINT32_ to a string
					 * @method toString
					 * @param {Number} radix (optional, default=10)
					 * @return {String} the converted UINT32
					 */
					UINT32.prototype.toString = function (radix) {
						return this.toNumber().toString(radix || 10)
					}

					/**
					 * Add two _UINT32_. The current _UINT32_ stores the result
					 * @method add
					 * @param {Object} other UINT32
					 * @return ThisExpression
					 */
					UINT32.prototype.add = function (other) {
						var a00 = this._low + other._low
						var a16 = a00 >>> 16

						a16 += this._high + other._high

						this._low = a00 & 0xFFFF
						this._high = a16 & 0xFFFF

						return this
					}

					/**
					 * Subtract two _UINT32_. The current _UINT32_ stores the result
					 * @method subtract
					 * @param {Object} other UINT32
					 * @return ThisExpression
					 */
					UINT32.prototype.subtract = function (other) {
						return this.add(other.clone().negate())
					}

					/**
					 * Multiply two _UINT32_. The current _UINT32_ stores the result
					 * @method multiply
					 * @param {Object} other UINT32
					 * @return ThisExpression
					 */
					UINT32.prototype.multiply = function (other) {
						var a16 = this._high
						var a00 = this._low
						var b16 = other._high
						var b00 = other._low
						var c16, c00
						c00 = a00 * b00
						c16 = c00 >>> 16
						c16 += a16 * b00
						c16 &= 0xFFFF
						c16 += a00 * b16
						this._low = c00 & 0xFFFF
						this._high = c16 & 0xFFFF
						return this
					}

					/**
					 * Divide two _UINT32_. The current _UINT32_ stores the result.
					 * The remainder is made available as the _remainder_ property on
					 * the _UINT32_ object. It can be null, meaning there are no remainder.
					 * @method div
					 * @param {Object} other UINT32
					 * @return ThisExpression
					 */
					UINT32.prototype.div = function (other) {
						if ((other._low == 0) && (other._high == 0)) throw Error('division by zero')
						if (other._high == 0 && other._low == 1) {
							this.remainder = new UINT32(0)
							return this
						}
						if (other.gt(this)) {
							this.remainder = this.clone()
							this._low = 0
							this._high = 0
							return this
						}
						if (this.eq(other)) {
							this.remainder = new UINT32(0)
							this._low = 1
							this._high = 0
							return this
						}
						var _other = other.clone()
						var i = -1
						while (!this.lt(_other)) {
							_other.shiftLeft(1, true)
							i++
						}

						this.remainder = this.clone()
						this._low = 0
						this._high = 0
						for (; i >= 0; i--) {
							_other.shiftRight(1)
							if (!this.remainder.lt(_other)) {
								this.remainder.subtract(_other)
								if (i >= 16) {
									this._high |= 1 << (i - 16)
								} else {
									this._low |= 1 << i
								}
							}
						}
						return this
					}

					/**
					 * Negate the current _UINT32_
					 * @method negate
					 * @return ThisExpression
					 */
					UINT32.prototype.negate = function () {
						var v = (~this._low & 0xFFFF) + 1
						this._low = v & 0xFFFF
						this._high = (~this._high + (v >>> 16)) & 0xFFFF

						return this
					}

					/**
					 * Equals
					 * @method eq
					 * @param {Object} other UINT32
					 * @return {Boolean}
					 */
					UINT32.prototype.equals = UINT32.prototype.eq = function (other) {
						return (this._low == other._low) && (this._high == other._high)
					}

					/**
					 * Greater than (strict)
					 * @method gt
					 * @param {Object} other UINT32
					 * @return {Boolean}
					 */
					UINT32.prototype.greaterThan = UINT32.prototype.gt = function (other) {
						if (this._high > other._high) return true
						if (this._high < other._high) return false
						return this._low > other._low
					}

					/**
					 * Less than (strict)
					 * @method lt
					 * @param {Object} other UINT32
					 * @return {Boolean}
					 */
					UINT32.prototype.lessThan = UINT32.prototype.lt = function (other) {
						if (this._high < other._high) return true
						if (this._high > other._high) return false
						return this._low < other._low
					}

					/**
					 * Bitwise OR
					 * @method or
					 * @param {Object} other UINT32
					 * @return ThisExpression
					 */
					UINT32.prototype.or = function (other) {
						this._low |= other._low
						this._high |= other._high

						return this
					}

					/**
					 * Bitwise AND
					 * @method and
					 * @param {Object} other UINT32
					 * @return ThisExpression
					 */
					UINT32.prototype.and = function (other) {
						this._low &= other._low
						this._high &= other._high

						return this
					}

					/**
					 * Bitwise NOT
					 * @method not
					 * @return ThisExpression
					 */
					UINT32.prototype.not = function () {
						this._low = ~this._low & 0xFFFF
						this._high = ~this._high & 0xFFFF

						return this
					}

					/**
					 * Bitwise XOR
					 * @method xor
					 * @param {Object} other UINT32
					 * @return ThisExpression
					 */
					UINT32.prototype.xor = function (other) {
						this._low ^= other._low
						this._high ^= other._high

						return this
					}

					/**
					 * Bitwise shift right
					 * @method shiftRight
					 * @param {Number} number of bits to shift
					 * @return ThisExpression
					 */
					UINT32.prototype.shiftRight = UINT32.prototype.shiftr = function (n) {
						if (n > 16) {
							this._low = this._high >> (n - 16)
							this._high = 0
						} else if (n == 16) {
							this._low = this._high
							this._high = 0
						} else {
							this._low = (this._low >> n) | ((this._high << (16 - n)) & 0xFFFF)
							this._high >>= n
						}

						return this
					}

					/**
					 * Bitwise shift left
					 * @method shiftLeft
					 * @param {Number} number of bits to shift
					 * @param {Boolean} allow overflow
					 * @return ThisExpression
					 */
					UINT32.prototype.shiftLeft = UINT32.prototype.shiftl = function (n, allowOverflow) {
						if (n > 16) {
							this._high = this._low << (n - 16)
							this._low = 0
							if (!allowOverflow) {
								this._high &= 0xFFFF
							}
						} else if (n == 16) {
							this._high = this._low
							this._low = 0
						} else {
							this._high = (this._high << n) | (this._low >> (16 - n))
							this._low = (this._low << n) & 0xFFFF
							if (!allowOverflow) {
								this._high &= 0xFFFF
							}
						}
						return this
					}

					/**
					 * Bitwise rotate left
					 * @method rotl
					 * @param {Number} number of bits to rotate
					 * @return ThisExpression
					 */
					UINT32.prototype.rotateLeft = UINT32.prototype.rotl = function (n) {
						var v = (this._high << 16) | this._low
						v = (v << n) | (v >>> (32 - n))
						this._low = v & 0xFFFF
						this._high = v >>> 16

						return this
					}

					/**
					 * Bitwise rotate right
					 * @method rotr
					 * @param {Number} number of bits to rotate
					 * @return ThisExpression
					 */
					UINT32.prototype.rotateRight = UINT32.prototype.rotr = function (n) {
						var v = (this._high << 16) | this._low
						v = (v >>> n) | (v << (32 - n))
						this._low = v & 0xFFFF
						this._high = v >>> 16

						return this
					}

					/**
					 * Clone the current _UINT32_
					 * @method clone
					 * @return {Object} cloned UINT32
					 */
					UINT32.prototype.clone = function () {
						return new UINT32(this._low, this._high)
					}

					if (true) {
						// AMD / RequireJS
						!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
								return UINT32
							}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
							__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
					} else if (typeof module != 'undefined' && module.exports) {
						// Node.js
						module.exports = UINT32
					} else {
						// Browser
						root['UINT32'] = UINT32
					}
				})(this)
			}),
			(function (module, exports, __webpack_require__) {
				var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
				(function (root) {
					var radixPowerCache = {
						16: UINT64(Math.pow(16, 5)),
						10: UINT64(Math.pow(10, 5)),
						2: UINT64(Math.pow(2, 5))
					}
					var radixCache = {
						16: UINT64(16),
						10: UINT64(10),
						2: UINT64(2)
					}

					/**
					 *	Represents an unsigned 64 bits integer
					 * @constructor
					 * @param {Number} first low bits (8)
					 * @param {Number} second low bits (8)
					 * @param {Number} first high bits (8)
					 * @param {Number} second high bits (8)
					 * or
					 * @param {Number} low bits (32)
					 * @param {Number} high bits (32)
					 * or
					 * @param {String|Number} integer as a string 		 | integer as a number
					 * @param {Number|Undefined} radix (optional, default=10)
					 * @return 
					 */
					function UINT64(a00, a16, a32, a48) {
						if (!(this instanceof UINT64))
							return new UINT64(a00, a16, a32, a48)

						this.remainder = null
						if (typeof a00 == 'string')
							return fromString.call(this, a00, a16)

						if (typeof a16 == 'undefined')
							return fromNumber.call(this, a00)

						fromBits.apply(this, arguments)
					}

					/**
					 * Set the current _UINT64_ object with its low and high bits
					 * @method fromBits
					 * @param {Number} first low bits (8)
					 * @param {Number} second low bits (8)
					 * @param {Number} first high bits (8)
					 * @param {Number} second high bits (8)
					 * or
					 * @param {Number} low bits (32)
					 * @param {Number} high bits (32)
					 * @return ThisExpression
					 */
					function fromBits(a00, a16, a32, a48) {
						if (typeof a32 == 'undefined') {
							this._a00 = a00 & 0xFFFF
							this._a16 = a00 >>> 16
							this._a32 = a16 & 0xFFFF
							this._a48 = a16 >>> 16
							return this
						}

						this._a00 = a00 | 0
						this._a16 = a16 | 0
						this._a32 = a32 | 0
						this._a48 = a48 | 0

						return this
					}
					UINT64.prototype.fromBits = fromBits

					/**
					 * Set the current _UINT64_ object from a number
					 * @method fromNumber
					 * @param {Number} number
					 * @return ThisExpression
					 */
					function fromNumber(value) {
						this._a00 = value & 0xFFFF
						this._a16 = value >>> 16
						this._a32 = 0
						this._a48 = 0

						return this
					}
					UINT64.prototype.fromNumber = fromNumber

					/**
					 * Set the current _UINT64_ object from a string
					 * @method fromString
					 * @param {String} integer as a string
					 * @param {Number} radix (optional, default=10)
					 * @return ThisExpression
					 */
					function fromString(s, radix) {
						radix = radix || 10

						this._a00 = 0
						this._a16 = 0
						this._a32 = 0
						this._a48 = 0

						var radixUint = radixPowerCache[radix] || new UINT64(Math.pow(radix, 5))
						for (var i = 0, len = s.length; i < len; i += 5) {
							var size = Math.min(5, len - i)
							var value = parseInt(s.slice(i, i + size), radix)
							this.multiply(
									size < 5 ?
									new UINT64(Math.pow(radix, size)) :
									radixUint
								)
								.add(new UINT64(value))
						}

						return this
					}
					UINT64.prototype.fromString = fromString

					/**
					 * Convert this _UINT64_ to a number (last 32 bits are dropped)
					 * @method toNumber
					 * @return {Number} the converted UINT64
					 */
					UINT64.prototype.toNumber = function () {
						return (this._a16 * 65536) + this._a00
					}

					/**
					 * Convert this _UINT64_ to a string
					 * @method toString
					 * @param {Number} radix (optional, default=10)
					 * @return {String} the converted UINT64
					 */
					UINT64.prototype.toString = function (radix) {
						radix = radix || 10
						var radixUint = radixCache[radix] || new UINT64(radix)

						if (!this.gt(radixUint)) return this.toNumber().toString(radix)

						var self = this.clone()
						var res = new Array(64)
						for (var i = 63; i >= 0; i--) {
							self.div(radixUint)
							res[i] = self.remainder.toNumber().toString(radix)
							if (!self.gt(radixUint)) break
						}
						res[i - 1] = self.toNumber().toString(radix)

						return res.join('')
					}

					/**
					 * Add two _UINT64_. The current _UINT64_ stores the result
					 * @method add
					 * @param {Object} other UINT64
					 * @return ThisExpression
					 */
					UINT64.prototype.add = function (other) {
						var a00 = this._a00 + other._a00

						var a16 = a00 >>> 16
						a16 += this._a16 + other._a16

						var a32 = a16 >>> 16
						a32 += this._a32 + other._a32

						var a48 = a32 >>> 16
						a48 += this._a48 + other._a48

						this._a00 = a00 & 0xFFFF
						this._a16 = a16 & 0xFFFF
						this._a32 = a32 & 0xFFFF
						this._a48 = a48 & 0xFFFF

						return this
					}

					/**
					 * Subtract two _UINT64_. The current _UINT64_ stores the result
					 * @method subtract
					 * @param {Object} other UINT64
					 * @return ThisExpression
					 */
					UINT64.prototype.subtract = function (other) {
						return this.add(other.clone().negate())
					}

					/**
					 * Multiply two _UINT64_. The current _UINT64_ stores the result
					 * @method multiply
					 * @param {Object} other UINT64
					 * @return ThisExpression
					 */
					UINT64.prototype.multiply = function (other) {
						var a00 = this._a00
						var a16 = this._a16
						var a32 = this._a32
						var a48 = this._a48
						var b00 = other._a00
						var b16 = other._a16
						var b32 = other._a32
						var b48 = other._a48

						var c00 = a00 * b00

						var c16 = c00 >>> 16
						c16 += a00 * b16
						var c32 = c16 >>> 16
						c16 &= 0xFFFF
						c16 += a16 * b00

						c32 += c16 >>> 16
						c32 += a00 * b32
						var c48 = c32 >>> 16
						c32 &= 0xFFFF
						c32 += a16 * b16
						c48 += c32 >>> 16
						c32 &= 0xFFFF
						c32 += a32 * b00

						c48 += c32 >>> 16
						c48 += a00 * b48
						c48 &= 0xFFFF
						c48 += a16 * b32
						c48 &= 0xFFFF
						c48 += a32 * b16
						c48 &= 0xFFFF
						c48 += a48 * b00

						this._a00 = c00 & 0xFFFF
						this._a16 = c16 & 0xFFFF
						this._a32 = c32 & 0xFFFF
						this._a48 = c48 & 0xFFFF

						return this
					}

					/**
					 * Divide two _UINT64_. The current _UINT64_ stores the result.
					 * The remainder is made available as the _remainder_ property on
					 * the _UINT64_ object. It can be null, meaning there are no remainder.
					 * @method div
					 * @param {Object} other UINT64
					 * @return ThisExpression
					 */
					UINT64.prototype.div = function (other) {
						if ((other._a16 == 0) && (other._a32 == 0) && (other._a48 == 0)) {
							if (other._a00 == 0) throw Error('division by zero')

							// other == 1: this
							if (other._a00 == 1) {
								this.remainder = new UINT64(0)
								return this
							}
						}

						// other > this: 0
						if (other.gt(this)) {
							this.remainder = this.clone()
							this._a00 = 0
							this._a16 = 0
							this._a32 = 0
							this._a48 = 0
							return this
						}
						// other == this: 1
						if (this.eq(other)) {
							this.remainder = new UINT64(0)
							this._a00 = 1
							this._a16 = 0
							this._a32 = 0
							this._a48 = 0
							return this
						}
						var _other = other.clone()
						var i = -1
						while (!this.lt(_other)) {
							_other.shiftLeft(1, true)
							i++
						}
						this.remainder = this.clone()
						this._a00 = 0
						this._a16 = 0
						this._a32 = 0
						this._a48 = 0
						for (; i >= 0; i--) {
							_other.shiftRight(1)
							if (!this.remainder.lt(_other)) {
								this.remainder.subtract(_other)
								if (i >= 48) {
									this._a48 |= 1 << (i - 48)
								} else if (i >= 32) {
									this._a32 |= 1 << (i - 32)
								} else if (i >= 16) {
									this._a16 |= 1 << (i - 16)
								} else {
									this._a00 |= 1 << i
								}
							}
						}
						return this
					}

					/**
					 * Negate the current _UINT64_
					 * @method negate
					 * @return ThisExpression
					 */
					UINT64.prototype.negate = function () {
						var v = (~this._a00 & 0xFFFF) + 1
						this._a00 = v & 0xFFFF
						v = (~this._a16 & 0xFFFF) + (v >>> 16)
						this._a16 = v & 0xFFFF
						v = (~this._a32 & 0xFFFF) + (v >>> 16)
						this._a32 = v & 0xFFFF
						this._a48 = (~this._a48 + (v >>> 16)) & 0xFFFF

						return this
					}

					/**
					 * @method eq
					 * @param {Object} other UINT64
					 * @return {Boolean}
					 */
					UINT64.prototype.equals = UINT64.prototype.eq = function (other) {
						return (this._a48 == other._a48) && (this._a00 == other._a00) &&
							(this._a32 == other._a32) && (this._a16 == other._a16)
					}

					/**
					 * Greater than (strict)
					 * @method gt
					 * @param {Object} other UINT64
					 * @return {Boolean}
					 */
					UINT64.prototype.greaterThan = UINT64.prototype.gt = function (other) {
						if (this._a48 > other._a48) return true
						if (this._a48 < other._a48) return false
						if (this._a32 > other._a32) return true
						if (this._a32 < other._a32) return false
						if (this._a16 > other._a16) return true
						if (this._a16 < other._a16) return false
						return this._a00 > other._a00
					}

					/**
					 * Less than (strict)
					 * @method lt
					 * @param {Object} other UINT64
					 * @return {Boolean}
					 */
					UINT64.prototype.lessThan = UINT64.prototype.lt = function (other) {
						if (this._a48 < other._a48) return true
						if (this._a48 > other._a48) return false
						if (this._a32 < other._a32) return true
						if (this._a32 > other._a32) return false
						if (this._a16 < other._a16) return true
						if (this._a16 > other._a16) return false
						return this._a00 < other._a00
					}

					/**
					 * Bitwise OR
					 * @method or
					 * @param {Object} other UINT64
					 * @return ThisExpression
					 */
					UINT64.prototype.or = function (other) {
						this._a00 |= other._a00
						this._a16 |= other._a16
						this._a32 |= other._a32
						this._a48 |= other._a48

						return this
					}

					/**
					 * Bitwise AND
					 * @method and
					 * @param {Object} other UINT64
					 * @return ThisExpression
					 */
					UINT64.prototype.and = function (other) {
						this._a00 &= other._a00
						this._a16 &= other._a16
						this._a32 &= other._a32
						this._a48 &= other._a48

						return this
					}

					/**
					 * Bitwise XOR
					 * @method xor
					 * @param {Object} other UINT64
					 * @return ThisExpression
					 */
					UINT64.prototype.xor = function (other) {
						this._a00 ^= other._a00
						this._a16 ^= other._a16
						this._a32 ^= other._a32
						this._a48 ^= other._a48

						return this
					}

					/**
					 * Bitwise NOT
					 * @method not
					 * @return ThisExpression
					 */
					UINT64.prototype.not = function () {
						this._a00 = ~this._a00 & 0xFFFF
						this._a16 = ~this._a16 & 0xFFFF
						this._a32 = ~this._a32 & 0xFFFF
						this._a48 = ~this._a48 & 0xFFFF

						return this
					}

					/**
					 * Bitwise shift right
					 * @method shiftRight
					 * @param {Number} number of bits to shift
					 * @return ThisExpression
					 */
					UINT64.prototype.shiftRight = UINT64.prototype.shiftr = function (n) {
						n %= 64
						if (n >= 48) {
							this._a00 = this._a48 >> (n - 48)
							this._a16 = 0
							this._a32 = 0
							this._a48 = 0
						} else if (n >= 32) {
							n -= 32
							this._a00 = ((this._a32 >> n) | (this._a48 << (16 - n))) & 0xFFFF
							this._a16 = (this._a48 >> n) & 0xFFFF
							this._a32 = 0
							this._a48 = 0
						} else if (n >= 16) {
							n -= 16
							this._a00 = ((this._a16 >> n) | (this._a32 << (16 - n))) & 0xFFFF
							this._a16 = ((this._a32 >> n) | (this._a48 << (16 - n))) & 0xFFFF
							this._a32 = (this._a48 >> n) & 0xFFFF
							this._a48 = 0
						} else {
							this._a00 = ((this._a00 >> n) | (this._a16 << (16 - n))) & 0xFFFF
							this._a16 = ((this._a16 >> n) | (this._a32 << (16 - n))) & 0xFFFF
							this._a32 = ((this._a32 >> n) | (this._a48 << (16 - n))) & 0xFFFF
							this._a48 = (this._a48 >> n) & 0xFFFF
						}

						return this
					}

					/**
					 * Bitwise shift left
					 * @method shiftLeft
					 * @param {Number} number of bits to shift
					 * @param {Boolean} allow overflow
					 * @return ThisExpression
					 */
					UINT64.prototype.shiftLeft = UINT64.prototype.shiftl = function (n, allowOverflow) {
						n %= 64
						if (n >= 48) {
							this._a48 = this._a00 << (n - 48)
							this._a32 = 0
							this._a16 = 0
							this._a00 = 0
						} else if (n >= 32) {
							n -= 32
							this._a48 = (this._a16 << n) | (this._a00 >> (16 - n))
							this._a32 = (this._a00 << n) & 0xFFFF
							this._a16 = 0
							this._a00 = 0
						} else if (n >= 16) {
							n -= 16
							this._a48 = (this._a32 << n) | (this._a16 >> (16 - n))
							this._a32 = ((this._a16 << n) | (this._a00 >> (16 - n))) & 0xFFFF
							this._a16 = (this._a00 << n) & 0xFFFF
							this._a00 = 0
						} else {
							this._a48 = (this._a48 << n) | (this._a32 >> (16 - n))
							this._a32 = ((this._a32 << n) | (this._a16 >> (16 - n))) & 0xFFFF
							this._a16 = ((this._a16 << n) | (this._a00 >> (16 - n))) & 0xFFFF
							this._a00 = (this._a00 << n) & 0xFFFF
						}
						if (!allowOverflow) {
							this._a48 &= 0xFFFF
						}
						return this
					}

					/**
					 * Bitwise rotate left
					 * @method rotl
					 * @param {Number} number of bits to rotate
					 * @return ThisExpression
					 */
					UINT64.prototype.rotateLeft = UINT64.prototype.rotl = function (n) {
						n %= 64
						if (n == 0) return this
						if (n >= 32) {
							// A.B.C.D
							// B.C.D.A rotl(16)
							// C.D.A.B rotl(32)
							var v = this._a00
							this._a00 = this._a32
							this._a32 = v
							v = this._a48
							this._a48 = this._a16
							this._a16 = v
							if (n == 32) return this
							n -= 32
						}

						var high = (this._a48 << 16) | this._a32
						var low = (this._a16 << 16) | this._a00

						var _high = (high << n) | (low >>> (32 - n))
						var _low = (low << n) | (high >>> (32 - n))

						this._a00 = _low & 0xFFFF
						this._a16 = _low >>> 16
						this._a32 = _high & 0xFFFF
						this._a48 = _high >>> 16

						return this
					}

					/**
					 * Bitwise rotate right
					 * @method rotr
					 * @param {Number} number of bits to rotate
					 * @return ThisExpression
					 */
					UINT64.prototype.rotateRight = UINT64.prototype.rotr = function (n) {
						n %= 64
						if (n == 0) return this
						if (n >= 32) {
							// A.B.C.D
							// D.A.B.C rotr(16)
							// C.D.A.B rotr(32)
							var v = this._a00
							this._a00 = this._a32
							this._a32 = v
							v = this._a48
							this._a48 = this._a16
							this._a16 = v
							if (n == 32) return this
							n -= 32
						}

						var high = (this._a48 << 16) | this._a32
						var low = (this._a16 << 16) | this._a00

						var _high = (high >>> n) | (low << (32 - n))
						var _low = (low >>> n) | (high << (32 - n))

						this._a00 = _low & 0xFFFF
						this._a16 = _low >>> 16
						this._a32 = _high & 0xFFFF
						this._a48 = _high >>> 16

						return this
					}

					/**
					 * Clone the current _UINT64_
					 * @method clone
					 * @return {Object} cloned UINT64
					 */
					UINT64.prototype.clone = function () {
						return new UINT64(this._a00, this._a16, this._a32, this._a48)
					}

					if (true) {
						!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
								return UINT64
							}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
							__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
					} else if (typeof module != 'undefined' && module.exports) {
						// Node.js
						module.exports = UINT64
					} else {
						// Browser
						root['UINT64'] = UINT64
					}
				})(this)
			}),
			(function (module, exports, __webpack_require__) {

				/* WEBPACK VAR INJECTION */
				(function (Buffer) {
					var UINT64 = __webpack_require__(1).UINT64

					//Constants
					var PRIME64_1 = UINT64('11400714785074694791')
					var PRIME64_2 = UINT64('14029467366897019727')
					var PRIME64_3 = UINT64('1609587929392839161')
					var PRIME64_4 = UINT64('9650029242287828579')
					var PRIME64_5 = UINT64('2870177450012600261')

					/**
					 * Convert string to proper UTF-8 array
					 * @param str Input string
					 * @returns {Uint8Array} UTF8 array is returned as uint8 array
					 */
					function toUTF8Array(str) {
						var utf8 = []
						for (var i = 0, n = str.length; i < n; i++) {
							var charcode = str.charCodeAt(i)
							if (charcode < 0x80) utf8.push(charcode)
							else if (charcode < 0x800) {
								utf8.push(0xc0 | (charcode >> 6),
									0x80 | (charcode & 0x3f))
							} else if (charcode < 0xd800 || charcode >= 0xe000) {
								utf8.push(0xe0 | (charcode >> 12),
									0x80 | ((charcode >> 6) & 0x3f),
									0x80 | (charcode & 0x3f))
							}
							// surrogate pair
							else {
								i++;
								charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
									(str.charCodeAt(i) & 0x3ff))
								utf8.push(0xf0 | (charcode >> 18),
									0x80 | ((charcode >> 12) & 0x3f),
									0x80 | ((charcode >> 6) & 0x3f),
									0x80 | (charcode & 0x3f))
							}
						}
						return new Uint8Array(utf8)
					}

					/**
					 * XXH64 object used as a constructor or a function
					 * @constructor
					 * or
					 * @param {Object|String} input data
					 * @param {Number|UINT64} seed
					 * @return ThisExpression
					 * or
					 * @return {UINT64} xxHash
					 */
					function XXH64() {
						if (arguments.length == 2)
							return new XXH64(arguments[1]).update(arguments[0]).digest()

						if (!(this instanceof XXH64))
							return new XXH64(arguments[0])

						init.call(this, arguments[0])
					}

					/**
					 * Initialize the XXH64 instance with the given seed
					 * @method init
					 * @param {Number|Object} seed as a number or an unsigned 32 bits integer
					 * @return ThisExpression
					 */
					function init(seed) {
						this.seed = seed instanceof UINT64 ? seed.clone() : UINT64(seed)
						this.v1 = this.seed.clone().add(PRIME64_1).add(PRIME64_2)
						this.v2 = this.seed.clone().add(PRIME64_2)
						this.v3 = this.seed.clone()
						this.v4 = this.seed.clone().subtract(PRIME64_1)
						this.total_len = 0
						this.memsize = 0
						this.memory = null

						return this
					}
					XXH64.prototype.init = init

					/**
					 * Add data to be computed for the XXH64 hash
					 * @method update
					 * @param {String|Buffer|ArrayBuffer} input as a string or nodejs Buffer or ArrayBuffer
					 * @return ThisExpression
					 */
					XXH64.prototype.update = function (input) {
						var isString = typeof input == 'string'
						var isArrayBuffer

						if (isString) {
							input = toUTF8Array(input)
							isString = false
							isArrayBuffer = true
						}

						if (typeof ArrayBuffer !== "undefined" && input instanceof ArrayBuffer) {
							isArrayBuffer = true
							input = new Uint8Array(input);
						}

						var p = 0
						var len = input.length
						var bEnd = p + len

						if (len == 0) return this

						this.total_len += len

						if (this.memsize == 0) {
							if (isString) {
								this.memory = ''
							} else if (isArrayBuffer) {
								this.memory = new Uint8Array(32)
							} else {
								this.memory = new Buffer(32)
							}
						}

						if (this.memsize + len < 32) // fill in tmp buffer
						{
							// XXH64_memcpy(this.memory + this.memsize, input, len)
							if (isString) {
								this.memory += input
							} else if (isArrayBuffer) {
								this.memory.set(input.subarray(0, len), this.memsize)
							} else {
								input.copy(this.memory, this.memsize, 0, len)
							}

							this.memsize += len
							return this
						}

						if (this.memsize > 0) {
							if (isString) {
								this.memory += input.slice(0, 32 - this.memsize)
							} else if (isArrayBuffer) {
								this.memory.set(input.subarray(0, 32 - this.memsize), this.memsize)
							} else {
								input.copy(this.memory, this.memsize, 0, 32 - this.memsize)
							}

							var p64 = 0
							if (isString) {
								var other
								other = UINT64(
									(this.memory.charCodeAt(p64 + 1) << 8) | this.memory.charCodeAt(p64), (this.memory.charCodeAt(p64 + 3) << 8) | this.memory.charCodeAt(p64 + 2), (this.memory.charCodeAt(p64 + 5) << 8) | this.memory.charCodeAt(p64 + 4), (this.memory.charCodeAt(p64 + 7) << 8) | this.memory.charCodeAt(p64 + 6)
								)
								this.v1.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
								p64 += 8
								other = UINT64(
									(this.memory.charCodeAt(p64 + 1) << 8) | this.memory.charCodeAt(p64), (this.memory.charCodeAt(p64 + 3) << 8) | this.memory.charCodeAt(p64 + 2), (this.memory.charCodeAt(p64 + 5) << 8) | this.memory.charCodeAt(p64 + 4), (this.memory.charCodeAt(p64 + 7) << 8) | this.memory.charCodeAt(p64 + 6)
								)
								this.v2.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
								p64 += 8
								other = UINT64(
									(this.memory.charCodeAt(p64 + 1) << 8) | this.memory.charCodeAt(p64), (this.memory.charCodeAt(p64 + 3) << 8) | this.memory.charCodeAt(p64 + 2), (this.memory.charCodeAt(p64 + 5) << 8) | this.memory.charCodeAt(p64 + 4), (this.memory.charCodeAt(p64 + 7) << 8) | this.memory.charCodeAt(p64 + 6)
								)
								this.v3.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
								p64 += 8
								other = UINT64(
									(this.memory.charCodeAt(p64 + 1) << 8) | this.memory.charCodeAt(p64), (this.memory.charCodeAt(p64 + 3) << 8) | this.memory.charCodeAt(p64 + 2), (this.memory.charCodeAt(p64 + 5) << 8) | this.memory.charCodeAt(p64 + 4), (this.memory.charCodeAt(p64 + 7) << 8) | this.memory.charCodeAt(p64 + 6)
								)
								this.v4.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
							} else {
								var other
								other = UINT64(
									(this.memory[p64 + 1] << 8) | this.memory[p64], (this.memory[p64 + 3] << 8) | this.memory[p64 + 2], (this.memory[p64 + 5] << 8) | this.memory[p64 + 4], (this.memory[p64 + 7] << 8) | this.memory[p64 + 6]
								)
								this.v1.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
								p64 += 8
								other = UINT64(
									(this.memory[p64 + 1] << 8) | this.memory[p64], (this.memory[p64 + 3] << 8) | this.memory[p64 + 2], (this.memory[p64 + 5] << 8) | this.memory[p64 + 4], (this.memory[p64 + 7] << 8) | this.memory[p64 + 6]
								)
								this.v2.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
								p64 += 8
								other = UINT64(
									(this.memory[p64 + 1] << 8) | this.memory[p64], (this.memory[p64 + 3] << 8) | this.memory[p64 + 2], (this.memory[p64 + 5] << 8) | this.memory[p64 + 4], (this.memory[p64 + 7] << 8) | this.memory[p64 + 6]
								)
								this.v3.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
								p64 += 8
								other = UINT64(
									(this.memory[p64 + 1] << 8) | this.memory[p64], (this.memory[p64 + 3] << 8) | this.memory[p64 + 2], (this.memory[p64 + 5] << 8) | this.memory[p64 + 4], (this.memory[p64 + 7] << 8) | this.memory[p64 + 6]
								)
								this.v4.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
							}

							p += 32 - this.memsize
							this.memsize = 0
							if (isString) this.memory = ''
						}

						if (p <= bEnd - 32) {
							var limit = bEnd - 32

							do {
								if (isString) {
									var other
									other = UINT64(
										(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2), (input.charCodeAt(p + 5) << 8) | input.charCodeAt(p + 4), (input.charCodeAt(p + 7) << 8) | input.charCodeAt(p + 6)
									)
									this.v1.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
									p += 8
									other = UINT64(
										(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2), (input.charCodeAt(p + 5) << 8) | input.charCodeAt(p + 4), (input.charCodeAt(p + 7) << 8) | input.charCodeAt(p + 6)
									)
									this.v2.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
									p += 8
									other = UINT64(
										(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2), (input.charCodeAt(p + 5) << 8) | input.charCodeAt(p + 4), (input.charCodeAt(p + 7) << 8) | input.charCodeAt(p + 6)
									)
									this.v3.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
									p += 8
									other = UINT64(
										(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2), (input.charCodeAt(p + 5) << 8) | input.charCodeAt(p + 4), (input.charCodeAt(p + 7) << 8) | input.charCodeAt(p + 6)
									)
									this.v4.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
								} else {
									var other
									other = UINT64(
										(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2], (input[p + 5] << 8) | input[p + 4], (input[p + 7] << 8) | input[p + 6]
									)
									this.v1.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
									p += 8
									other = UINT64(
										(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2], (input[p + 5] << 8) | input[p + 4], (input[p + 7] << 8) | input[p + 6]
									)
									this.v2.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
									p += 8
									other = UINT64(
										(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2], (input[p + 5] << 8) | input[p + 4], (input[p + 7] << 8) | input[p + 6]
									)
									this.v3.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
									p += 8
									other = UINT64(
										(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2], (input[p + 5] << 8) | input[p + 4], (input[p + 7] << 8) | input[p + 6]
									)
									this.v4.add(other.multiply(PRIME64_2)).rotl(31).multiply(PRIME64_1);
								}
								p += 8
							} while (p <= limit)
						}

						if (p < bEnd) {
							if (isString) {
								this.memory += input.slice(p)
							} else if (isArrayBuffer) {
								this.memory.set(input.subarray(p, bEnd), this.memsize)
							} else {
								input.copy(this.memory, this.memsize, p, bEnd)
							}
							this.memsize = bEnd - p
						}
						return this
					}

					/**
					 * Finalize the XXH64 computation. The XXH64 instance is ready for reuse for the given seed
					 * @method digest
					 * @return {UINT64} xxHash
					 */
					XXH64.prototype.digest = function () {
						var input = this.memory
						var isString = typeof input == 'string'
						var p = 0
						var bEnd = this.memsize
						var h64, h
						var u = new UINT64

						if (this.total_len >= 32) {
							h64 = this.v1.clone().rotl(1)
							h64.add(this.v2.clone().rotl(7))
							h64.add(this.v3.clone().rotl(12))
							h64.add(this.v4.clone().rotl(18))

							h64.xor(this.v1.multiply(PRIME64_2).rotl(31).multiply(PRIME64_1))
							h64.multiply(PRIME64_1).add(PRIME64_4)

							h64.xor(this.v2.multiply(PRIME64_2).rotl(31).multiply(PRIME64_1))
							h64.multiply(PRIME64_1).add(PRIME64_4)

							h64.xor(this.v3.multiply(PRIME64_2).rotl(31).multiply(PRIME64_1))
							h64.multiply(PRIME64_1).add(PRIME64_4)

							h64.xor(this.v4.multiply(PRIME64_2).rotl(31).multiply(PRIME64_1))
							h64.multiply(PRIME64_1).add(PRIME64_4)
						} else {
							h64 = this.seed.clone().add(PRIME64_5)
						}

						h64.add(u.fromNumber(this.total_len))

						while (p <= bEnd - 8) {
							if (isString) {
								u.fromBits(
									(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2), (input.charCodeAt(p + 5) << 8) | input.charCodeAt(p + 4), (input.charCodeAt(p + 7) << 8) | input.charCodeAt(p + 6)
								)
							} else {
								u.fromBits(
									(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2], (input[p + 5] << 8) | input[p + 4], (input[p + 7] << 8) | input[p + 6]
								)
							}
							u.multiply(PRIME64_2).rotl(31).multiply(PRIME64_1)
							h64
								.xor(u)
								.rotl(27)
								.multiply(PRIME64_1)
								.add(PRIME64_4)
							p += 8
						}

						if (p + 4 <= bEnd) {
							if (isString) {
								u.fromBits(
									(input.charCodeAt(p + 1) << 8) | input.charCodeAt(p), (input.charCodeAt(p + 3) << 8) | input.charCodeAt(p + 2), 0, 0
								)
							} else {
								u.fromBits(
									(input[p + 1] << 8) | input[p], (input[p + 3] << 8) | input[p + 2], 0, 0
								)
							}
							h64
								.xor(u.multiply(PRIME64_1))
								.rotl(23)
								.multiply(PRIME64_2)
								.add(PRIME64_3)
							p += 4
						}

						while (p < bEnd) {
							u.fromBits(isString ? input.charCodeAt(p++) : input[p++], 0, 0, 0)
							h64
								.xor(u.multiply(PRIME64_5))
								.rotl(11)
								.multiply(PRIME64_1)
						}

						h = h64.clone().shiftRight(33)
						h64.xor(h).multiply(PRIME64_2)

						h = h64.clone().shiftRight(29)
						h64.xor(h).multiply(PRIME64_3)

						h = h64.clone().shiftRight(32)
						h64.xor(h)

						this.init(this.seed)

						return h64
					}

					module.exports = XXH64

					/* WEBPACK VAR INJECTION */
				}.call(exports, __webpack_require__(0).Buffer))
			})
		]);
});