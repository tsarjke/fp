//Проверка на блокировщик рекламы
function adBlocker() {
	var adBlock = false,
		elem = document.createElement('div');
	elem.className = 'adclass';
	document.body.appendChild(elem);
	var isAdblockEnabled = !(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
	if (isAdblockEnabled) {
		adBlock = true;
	}
	return adBlock;
}

//Значение Do Not Track (0, 1 или undefined)
function dnt() {
	var strOut = window.navigator.doNotTrack;
	if (strOut != 1) {
		strOut = undefined;
	}
	return strOut;
}

//Проверка на доступность Local Storage
function lsTest() {
	var test = 'test',
		ls;
	try {
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		ls = true;
	} catch (e) {
		ls = false;
	}
	if (ls === true) {
		return true;
	} else {
		return false;
	}
}

//Проверка на доступность Session Storage
function ssTest() {
	var test = 'test',
		ss;
	try {
		sessionStorage.setItem(test, test);
		sessionStorage.removeItem(test);
		ss = true;
	} catch (e) {
		ss = false;
	}
	if (ss === true) {
		return true;
	} else {
		return false;
	}
}

//Проверка на доступность IndexedDB
function indexedDB() {
	var strOnError, strOut;
	strOnError = true;
	strOut = "";

	try {
		strOut = !!window.indexedDB;
		return strOut;
	} catch (err) {
		return strOnError;
	}
}

//Проверка доступности cookie
function cookieTest() {
	var strOnError = "Error",
		bolCookieEnabled = null,
		bolOut = null;
	try {
		bolCookieEnabled = (navigator.cookieEnabled) ? true : false;
		if (typeof navigator.cookieEnabled === "undefined" && !bolCookieEnabled) {
			document.cookie = "testcookie";
			bolCookieEnabled = (document.cookie.indexOf("testcookie") !== -1) ? true : false;
		}
		bolOut = bolCookieEnabled;
		return bolOut;
	} catch (err) {
		return strOnError;
	}
}

//Получаем доступные шрифты
function fonts() {
	var strOnError = "Error",
		style = null,
		fonts = null,
		count = 0,
		template = null,
		fragment, divs = null,
		i = 0,
		font = null,
		div = null,
		body = null,
		result, e = null;

	try {
		style = "position: absolute; visibility: hidden; display: block !important";
		fonts = ["Abadi MT Condensed Light", "Adobe Fangsong Std", "Adobe Hebrew", "Adobe Ming Std", "Agency FB", "Aharoni", "Andalus", "Angsana New", "AngsanaUPC", "Aparajita", "Arab", "Arabic Transparent", "Arabic Typesetting", "Arial Baltic", "Arial Black", "Arial CE", "Arial CYR", "Arial Greek", "Arial TUR", "Arial", "Batang", "BatangChe", "Bauhaus 93", "Bell MT", "Bitstream Vera Serif", "Bodoni MT", "Bookman Old Style", "Braggadocio", "Broadway", "Browallia New", "BrowalliaUPC", "Calibri Light", "Calibri", "Californian FB", "Cambria Math", "Cambria", "Candara", "Castellar", "Casual", "Centaur", "Century Gothic", "Chalkduster", "Colonna MT", "Comic Sans MS", "Consolas", "Constantia", "Copperplate Gothic Light", "Corbel", "Cordia New", "CordiaUPC", "Courier New Baltic", "Courier New CE", "Courier New CYR", "Courier New Greek", "Courier New TUR", "Courier New", "DFKai-SB", "DaunPenh", "David", "DejaVu LGC Sans Mono", "Desdemona", "DilleniaUPC", "DokChampa", "Dotum", "DotumChe", "Ebrima", "Engravers MT", "Eras Bold ITC", "Estrangelo Edessa", "EucrosiaUPC", "Euphemia", "Eurostile", "FangSong", "Forte", "FrankRuehl", "Franklin Gothic Heavy", "Franklin Gothic Medium", "FreesiaUPC", "French Script MT", "Gabriola", "Gautami", "Georgia", "Gigi", "Gisha", "Goudy Old Style", "Gulim", "GulimChe", "GungSeo", "Gungsuh", "GungsuhChe", "Haettenschweiler", "Harrington", "Hei S", "HeiT", "Heisei Kaku Gothic", "Hiragino Sans GB", "Impact", "Informal Roman", "IrisUPC", "Iskoola Pota", "JasmineUPC", "KacstOne", "KaiTi", "Kalinga", "Kartika", "Khmer UI", "Kino MT", "KodchiangUPC", "Kokila", "Kozuka Gothic Pr6N", "Lao UI", "Latha", "Leelawadee", "Levenim MT", "LilyUPC", "Lohit Gujarati", "Loma", "Lucida Bright", "Lucida Console", "Lucida Fax", "Lucida Sans Unicode", "MS Gothic", "MS Mincho", "MS PGothic", "MS PMincho", "MS Reference Sans Serif", "MS UI Gothic", "MV Boli", "Magneto", "Malgun Gothic", "Mangal", "Marlett", "Matura MT Script Capitals", "Meiryo UI", "Meiryo", "Menlo", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Sans Serif", "Microsoft Tai Le", "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU-ExtB", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "Miriam Fixed", "Miriam", "Mongolian Baiti", "MoolBoran", "NSimSun", "Narkisim", "News Gothic MT", "Niagara Solid", "Nyala", "PMingLiU", "PMingLiU-ExtB", "Palace Script MT", "Palatino Linotype", "Papyrus", "Perpetua", "Plantagenet Cherokee", "Playbill", "Prelude Bold", "Prelude Condensed Bold", "Prelude Condensed Medium", "Prelude Medium", "PreludeCompressedWGL Black", "PreludeCompressedWGL Bold", "PreludeCompressedWGL Light", "PreludeCompressedWGL Medium", "PreludeCondensedWGL Black", "PreludeCondensedWGL Bold", "PreludeCondensedWGL Light", "PreludeCondensedWGL Medium", "PreludeWGL Black", "PreludeWGL Bold", "PreludeWGL Light", "PreludeWGL Medium", "Raavi", "Rachana", "Rockwell", "Rod", "Sakkal Majalla", "Sawasdee", "Script MT Bold", "Segoe Print", "Segoe Script", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol", "Segoe UI", "Shonar Bangla", "Showcard Gothic", "Shruti", "SimHei", "SimSun", "SimSun-ExtB", "Simplified Arabic Fixed", "Simplified Arabic", "Snap ITC", "Sylfaen", "Symbol", "Tahoma", "Times New Roman Baltic", "Times New Roman CE", "Times New Roman CYR", "Times New Roman Greek", "Times New Roman TUR", "Times New Roman", "TlwgMono", "Traditional Arabic", "Trebuchet MS", "Tunga", "Tw Cen MT Condensed Extra Bold", "Ubuntu", "Umpush", "Univers", "Utopia", "Utsaah", "Vani", "Verdana", "Vijaya", "Vladimir Script", "Vrinda", "Webdings", "Wide Latin", "Wingdings"];
		count = fonts.length;
		template = '<b style="display:inline !important; width:auto !important; font:normal 10px/1 \'X\',sans-serif !important">ww</b>' + '<b style="display:inline !important; width:auto !important; font:normal 10px/1 \'X\',monospace !important">ww</b>';
		fragment = document.createDocumentFragment();
		divs = [];
		for (i = 0; i < count; i = i + 1) {
			font = fonts[i];
			div = document.createElement('div');
			font = font.replace(/['"<>]/g, '');
			div.innerHTML = template.replace(/X/g, font);
			div.style.cssText = style;
			fragment.appendChild(div);
			divs.push(div);
		}
		body = document.body;
		body.insertBefore(fragment, body.firstChild);
		result = [];
		for (i = 0; i < count; i = i + 1) {
			e = divs[i].getElementsByTagName('b');
			if (e[0].offsetWidth === e[1].offsetWidth) {
				result.push(fonts[i]);
			}
		}
		for (i = 0; i < count; i = i + 1) {
			body.removeChild(divs[i]);
		}
		return result.join(', ');
	} catch (err) {
		return strOnError;
	}
}

//Проверка на совместимость с сенсорным экраном
function touch() {
	var bolTouchEnabled = false,
		bolOut = null;

	try {
		if (document.createEvent("TouchEvent")) {
			bolTouchEnabled = true;
		}
		bolOut = bolTouchEnabled;
		return bolOut;
	} catch (ignore) {
		bolOut = bolTouchEnabled;
		return bolOut;
	}
}

//Получение пикселей для Canvas
function canvas(opt) {
	var strOnError = "Error",
		canvas = null,
		strCText = null,
		strText = "abcdefghijklmnopqrstuvwxyz_ITMO2021_ABCDEFGHIJKLMNOPQRSTUVWXYZ`~1!2@3#4$5%6^7&8*9(0)-_=+[{]}|;:',<.>/?",
		strOut = null;

	try {
		if (opt == "draw") {
			canvas = document.getElementById("drawingCanvas");
		} else {
			canvas = document.createElement('canvas');
		}
		strCText = canvas.getContext('2d');
		strCText.textBaseline = "top";
		strCText.font = "14px 'Arial'";
		strCText.textBaseline = "alphabetic";
		strCText.fillStyle = "#00c";
		strCText.fillRect(186, 1, 70, 20);
		strCText.fillStyle = "#f00";
		strCText.fillText(strText, 2, 15);
		strCText.fillStyle = "rgba(150, 250, 150, 0.7)";
		strCText.fillText(strText, 4, 17);
		strOut = canvas.toDataURL();
	} catch (err) {
		return strOnError;
	}
	if (opt != "draw") {
		return strOut;
	}
}

//Vendor, renderer и пиксели
var webglResult = webgl();
//Создание элемента 3D canvas с WebGL, получение vendor, renderer и пикселей изображения 
function webgl(opt) {
	var strOnError = "Error",
		canvas, ctx, width = 256,
		height = 128;
	if (opt == "draw") {
		canvas = document.getElementById("drawingWebGL");
	} else {
		canvas = document.createElement('canvas');
	}
	canvas.width = width,
		canvas.height = height,
		ctx = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl") || canvas.getContext("moz-webgl");

	var debugInfo = ctx.getExtension('WEBGL_debug_renderer_info');
	vendor = ctx.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
	renderer = ctx.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

	try {
		var f = "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}";
		var g = "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}";
		var h = ctx.createBuffer();

		ctx.bindBuffer(ctx.ARRAY_BUFFER, h);

		var i = new Float32Array([-.2, -.9, 0, .4, -.26, 0, 0, .7321, 0]);

		ctx.bufferData(ctx.ARRAY_BUFFER, i, ctx.STATIC_DRAW), h.itemSize = 3, h.numItems = 3;

		var j = ctx.createProgram();
		var k = ctx.createShader(ctx.VERTEX_SHADER);

		ctx.shaderSource(k, f);
		ctx.compileShader(k);

		var l = ctx.createShader(ctx.FRAGMENT_SHADER);

		ctx.shaderSource(l, g);
		ctx.compileShader(l);
		ctx.attachShader(j, k);
		ctx.attachShader(j, l);
		ctx.linkProgram(j);
		ctx.useProgram(j);

		j.vertexPosAttrib = ctx.getAttribLocation(j, "attrVertex");
		j.offsetUniform = ctx.getUniformLocation(j, "uniformOffset");

		ctx.enableVertexAttribArray(j.vertexPosArray);
		ctx.vertexAttribPointer(j.vertexPosAttrib, h.itemSize, ctx.FLOAT, !1, 0, 0);
		ctx.uniform2f(j.offsetUniform, 1, 1);
		ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, h.numItems);

	} catch (e) {
		return strOnError;
	}
	if (opt != "draw") {
		var m = "";

		var n = new Uint8Array(width * height * 4);
		ctx.readPixels(0, 0, width, height, ctx.RGBA, ctx.UNSIGNED_BYTE, n);
		m = JSON.stringify(n).replace(/,?"[0-9]+":/g, "");
		var res = [vendor, renderer, m];
		return res;
	}
}

//аудио отпечаток (вызывать в хромиумах и эплах только по действию пользователя (например, клик мышкой))
function audio() {
	var ctx, strOnError = "Error";
	try {
		ctx =
			new(window.AudioContext || window.webkitAudioContext)();
	} catch (error) {
		return strOnError;
	}
	if (ctx !== undefined) {
		var freq_data = [];
		var oscillator = ctx.createOscillator();
		var analyser = ctx.createAnalyser();
		var gain = ctx.createGain();
		var scriptProcessor = ctx.createScriptProcessor(4096, 1, 1);
		gain.gain.value = 0;
		oscillator.connect(analyser);
		analyser.connect(scriptProcessor);
		scriptProcessor.connect(gain);
		gain.connect(ctx.destination);
		scriptProcessor.onaudioprocess = function (bins) {
			bins = new Float32Array(analyser.frequencyBinCount);
			analyser.getFloatFrequencyData(bins);
			for (var i = 0; i < bins.length; i = i + 1) {
				freq_data.push(bins[i]);
			}
			analyser.disconnect();
			scriptProcessor.disconnect();
			gain.disconnect();
			get_fp(freq_data[0]);
		};
		oscillator.start(0);
	}
}

//Данные для формирования цифрового отпечатка
var data = {
	"Свойства экрана": {
		"Размер экрана": window.screen.width + 'x' + window.screen.height,
		"Доступный размер окна браузера": window.screen.availWidth + 'x' + window.screen.availHeight,
		"Глубина цвета": window.screen.colorDepth,
		"Соотношение пикселей экрана": window.devicePixelRatio
	},
	"Особенности браузера": {
		"Пользовательский агент (User agent)": navigator.userAgent,
		"Блокировщик рекламы": adBlocker(),
		"Заголовок запрета отслеживания (Do Not Track)": dnt(),
		"Файлы cookie": cookieTest(),
		"Локальное хранилище (Local storage)": lsTest(),
		"Сессионное хранилище (Session storage)": ssTest(),
		"Индексная база данных (Indexed Database)": indexedDB(),
		"Плагины": navigator.plugins, //доделать
	},
	"Системные свойства": {
		"Часовой пояс": new Date().getTimezoneOffset(),
		"Формат даты": new Date(0).toLocaleString(),
		"Системные языки": window.navigator.languages,
		"Точность округления": Math.sin(Math.exp(1)),
		"Список шрифтов": fonts(),
	},
	"Аппаратные свойства": {
		"Платформа": navigator.platform,
		"Количество логических ядер процессора": navigator.hardwareConcurrency,
		"Совместимость с сенсорным экраном": touch(),
		"Canvas": XXH.h64(canvas(), 0xABCD).toString(16),
		"WebGL": /*navigator.vendor + ' ' +  */ webglResult[0] + ' ' + webglResult[1] + ' ' + XXH.h64(webglResult[2], 0xABCD).toString(16),
		"AudioContext": "Click to see",
	},
};

//Данные для формирования КРОССБРАУЗЕРНОГО цифрового отпечатка (параметры с нулем НЕ кроссбраузерные, для наглядности и сравнения)
var cb_data = {
	"Свойства экрана": {
		"Размер экрана": window.screen.width + 'x' + window.screen.height,
		"Доступный размер окна браузера": window.screen.availWidth + 'x' + window.screen.availHeight,
		"Глубина цвета": window.screen.colorDepth,
		"Соотношение пикселей экрана": window.devicePixelRatio
	},
	"Особенности браузера": {
		"Пользовательский агент (User agent)": 0,
		"Блокировщик рекламы": adBlocker(),
		"Заголовок запрета отслеживания (Do Not Track)": dnt(),
		"Файлы cookie": cookieTest(),
		"Локальное хранилище (Local storage)": lsTest(),
		"Сессионное хранилище (Session storage)": ssTest(),
		"Индексная база данных (Indexed Database)": indexedDB(),
		"Плагины": 0,
	},
	"Системные свойства": {
		"Часовой пояс": new Date().getTimezoneOffset(),
		"Формат даты": new Date(0).toLocaleString(),
		"Системные языки": window.navigator.languages,
		"Точность округления": Math.sin(Math.exp(1)),
		"Список шрифтов": 0,
	},
	"Аппаратные свойства": {
		"Платформа": navigator.platform,
		"Количество логических ядер процессора": navigator.hardwareConcurrency,
		"Совместимость с сенсорным экраном": touch(),
		"Canvas": 0,
		"WebGL": /*navigator.vendor + ' ' +  */ webglResult[0] + ' ' + webglResult[1] + ' ' + XXH.h64(webglResult[2], 0xABCD).toString(16),
		"AudioContext": 0,
	},
};

//Получить хеш отпечатка - общего и кроссбраузерного (вызывается в audio для отображения звукового отпечатка и добавления его к остальным данным)
//Плагины приходится вытаскивать отдельно
function get_fp(audio) {
	var full_fp, cb_fp, full_res = JSON.stringify(data),
		cb_res = JSON.stringify(cb_data),
		L = navigator.plugins.length,
		plugins = '';
	for (var i = 0; i < L; i++) {
		for (var j in navigator.plugins[i]) {
			for (var k in navigator.plugins[i][j]) {
				plugins += navigator.plugins[i][j][k];
			}
		}
	}
	full_res += audio;
	full_res += plugins;
	full_fp = XXH.h64(full_res, 0xABCD).toString(16);
	cb_fp = XXH.h64(cb_res, 0xABCD).toString(16);
	document.getElementById('full_fp').innerHTML = "Your fingerprint - " + full_fp;
	document.getElementById('cb_fp').innerHTML = "Your cross-browser fingerprint - " + cb_fp;
	document.getElementById('Audio').innerHTML = "AudioContext: " + audio;
}

//Получаем звуковой отпечаток по действию (клику мышкой или скроллу), а с ним и общий хеш отпечатка
var iOS = navigator.userAgent.match(/iPhone|iPad|iPod/i);
var action = "click";
if (iOS != null)
	action = "touchstart";
addEventListener(action, function audio_plus_fp() {
	this.removeEventListener(action, audio_plus_fp);
	audio();
});
addEventListener('scroll', function audio_plus_fp() {
	this.removeEventListener('scroll', audio_plus_fp);
	audio();
});

//вывод списком всех данных (для наглядности)
var list = '';
for (var i in data) {
	list += '<h2><p>' + i + '</p></h2>';
	list += '<ul class = "first">';
	for (var j in data[i]) {
		add = '';
		if (data[i][j] == cb_data[i][j]) {
			add = 'class = "cb"';
		}
		if (typeof (data[i][j]) == 'object') {
			list += '<li ' + add + '>' + j + ': ' + '</li>';
			list += '<ul class = "second">';
			for (var k in data[i][j]) {
				if (typeof (data[i][j][k]) == 'object') {
					list += '<li>' + k + ': ' + '</li>';
					list += '<ul class = "third">';
					for (var l in data[i][j][k]) {
						if (l == "name" || l == "filename" || l == "description") {
							list += '<li>' + l + ': ' + data[i][j][k][l] + '</li>';
						}
					}
					list += '</ul>';
				} else {
					//k = Number.parseInt(k);
					if (!isNaN(k)) {
						list += '<li>' + k + ': ' + data[i][j][k] + '</li>';
					}
				}
			}
			list += '</ul>';
		} else {
			if (j == 'AudioContext') {
				list += '<li id="Audio">' + j + ': ' + data[i][j] + '</li>';
			} else {
				list += '<li ' + add + '>' + j + ': ' + data[i][j] + '</li>';
			}
		}
		if (j == "Canvas") {
			list += '<h3><canvas id="drawingCanvas" width="300" height="30"></canvas></h3>';
		}
		if (j == "WebGL") {
			list += '<h3><canvas id="drawingWebGL" width="200" height="100"></canvas></h3>';
		}
	}
	list += '</ul>';
}
var result = '<h2 class="fp" id="full_fp">' + 'Click or scroll to see your fingerprint' + '</h2>';
result += '<h2 class="fp cb" id="cb_fp">' + 'And cross-browser fingerprint' + '</h2>';
document.getElementById('result').innerHTML += result;
document.getElementById('result').innerHTML += list;
canvas("draw");
webgl("draw");