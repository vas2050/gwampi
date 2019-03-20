var appid = '8070fe34e576d6a2acde6e884ed25201';

function fetchGeoData(callback) {
  // check if cached already
  var geoCity;
  if (!checkCookie('geoCity')) {
    getCoordinates(function(geoPos) {
      var geoUrl   = 'http://api.openweathermap.org/data/2.5/weather?';
      var geoQuery = 'lat=' + geoPos.lat + '&lon=' + geoPos.lon + '&appid=' + appid;
      var geoGet   = geoUrl + geoQuery;

      $.get(geoGet, function(data, status) {
        setCookie({name: 'geoCity', value: data.name, exp: '1w'});
      });
    });
  }

  // not relying on the above api, as data is not acurate!
  // so using weather-js node module

  var waitForCookie = setInterval(function() {
    if (checkCookie('geoCity')) {
      window.clearInterval(waitForCookie);
      geoCity = getCookie('geoCity');
      var dtype = $('#type').html().trim() || 'C'; 
      getWeather(geoCity, dtype, function(geoData, err) {
        callback(geoData, err);
      });
    }
  }, 2000);
}

function loadGeoData() {
  fetchGeoData(function(geoData, err) {
    if (err) {
      return({success: false, message: 'error'});
    }

    if (geoData) {
      var city = geoData.city.name;
      var temp = geoData.temp.current;
      var type = geoData.temp.type;
      var wind = geoData.wind.display;

      $('#city').html(city); 
      $('#temp').html(temp); 
      $('#type').html(type); 
      $('#wind').html(wind); 
    }
  });

  setTimeout('loadGeoData()', 30*60*1000); // 30m
}

function getCoordinates(callback) {
  var geoLoc = navigator.geolocation;
  if (geoLoc) {
    geoLoc.getCurrentPosition(function(pos) {
      geoPos = {
        'lat': pos.coords.latitude,
        'lon': pos.coords.longitude,
      }
      callback(geoPos);
    })
  } else {
    console.log("geoLocation not supported by this browser!");
  }
}

function clock() {
  var dt = new Date();
  var dateStr = dt.toDateString();
  var timeStr = dt.toLocaleTimeString();
  $('#clock').html(dateStr + ' ' + timeStr);

  setTimeout('clock()', 1000);
}

function downCounter(hhmmss) {
  var [hh, mm, ss] = hhmmss.split(/:/);
  if (ss > 0) {
    ss--;
  }
  else if (mm > 0) {
    mm--; ss = 59;
  }
  else {
    hh--; mm = 59; ss = 59;
  }

  var sec = hh * 60 * 60 + mm * 60 + ss;
  if (hh >= 0) {
    return([[hh,mm,ss].map(function(x){ return x.toString().padStart(2,0);}).join(':'), sec])
  }
  else {
    return([null, null]);
  }
}

function setCookie(cookie) {
  var cexp   = cookie.exp;
  var cvalue = cookie.value;
  var cname  = cookie.name;
  var cpath  = cookie.path || '/'; 

  if (cexp) {
    var [qty, unit] = cexp.match(/^(\d+)([smhdwM])$/).splice(1,2);

    if (unit === null) return "invalid expiry string";

    var msec = 1000;
    if (unit != 's') { msec *= 60;
      if (unit != 'm') { msec *= 60;
        if (unit != 'h') { msec *= 24;
          if (unit != 'd') { msec *= 7;
            if (unit != 'w') { msec *= 4;
              if (unit != 'M') msec *= 12;
            }
          }
        }
      }
    }

    msec *= qty;

    var dt = new Date();
    dt.setTime(dt.getTime() + msec);
    cexp = "expires=" + dt.toUTCString();
    console.log("cexp: ", cexp);
  }

  cvalue = btoa(JSON.stringify(cvalue));
  document.cookie = cname + '=' + cvalue + ';path=' + cpath + ';' + cexp;
}

function getCookie(cname) {
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookies = decodedCookie.split(';');
  for (var i in cookies) {
    var space;
    if (cookies[i].charAt(0) == ' ') cookies[i] = cookies[i].substring(1); 
    if (cookies[i].indexOf(cname + '=') == 0) {
      var cvalue = cookies[i].match(/^(\w+)=(.*)$/)[2];
      cvalue = JSON.parse(atob(cvalue));
      return cvalue;
    }
  }
  return "";
}

function checkCookie(cname) {
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookies = decodedCookie.split(';');
  for (var i in cookies) {
    var space;
    if (cookies[i].charAt(0) == ' ') cookies[i] = cookies[i].substring(1);
    if (cookies[i].indexOf(cname + '=') == 0) {
      return true;
    }
  }
  return false;
}

function getRandom(digits) {
  if (! /^\d+$/.test(digits)) digits = 1;

  return Math.floor(Math.random() * Math.pow(10, digits));
}

function getWeather(city, dtype, callback) {
  var geoData = {};

  $.ajax({
    url: '/weather/' + city + '/' + dtype,
    type: 'GET',
    success: function(w, status) {
      geoData = {
        city: {
          name: w.location.name,
          zip: w.location.zipcode || '',
          tz: w.location.timezone || '',
          lat: w.location.lat,
          long: w.location.long,
        },
        temp: {
          current: w.current.temperature,
          type: dtype,
        },
        wind: {
          speed: w.current.windspeed || '',
          display: w.current.winddisplay || '',
        },
      };

      callback(geoData, null);
    },
    error: function(xhr, status, err) {
      callback(null, err);
    }
  });
}

function testData() {
  var geoData = {
    id: getRandom(3),
    city: { name: 'Farmers Branch' },
    temp: {
      temp_max: 65,
      temp_min: 60,
      current: 60,
      type: 'F',
    },
    wind: {
      speed: '13.9 mph',
      display: '13.9 mph, West'
    },
  };
  setCookie({name: 'geoData', value: geoData, exp: '2m'});
}

function getF(C) {
  return (9/5*C+32).toFixed(1);
}

function getC(F) {
  return (5/9*(F-32)).toFixed(1);
}

function getM(k) {
  return (k*5/8).toFixed(1);
}

function getK(m) {
  return (m*8/5).toFixed(1);
}

function getMonthById(mm) {
  var month = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec'
  }
  return month[mm];
}

function getMonthByName(mon) {
  var month = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12'
  }
  return month[mon];
}

function uFirst(w) {
  w = w.trim();
  if (w) {
    w = w.toLowerCase();
    w = w[0].toUpperCase() + w.slice(1, w.length);
  }

  return w;
}

function uFull(s) {
  s = s.trim();
  if (s) {
    s = s.toLowerCase().split(/\s+/).map(function(x) { return x[0].toUpperCase() + x.slice(1, x.length); });
  }

  return s;
}

var foot_message = '';
function footer(color, message, end) {
  if (!message && !end) {
    $('div #mfoot').html('');
  }
  else {
    var html_message = '<span style="color:' + color + ';">' + message + '</span>';
    foot_message += ' ' + html_message;
    if (end == true) {
      $('div #mfoot').html(foot_message);
      foot_message = '';
    }
  }
}

function getCookieTime(sec) {
  var total = Math.trunc(sec / 1000)
  var ss = total % 60
  var mm = Math.trunc((total % (60 * 60)) / 60)
  var hh = Math.trunc(total / (60 * 60))
  return ([hh,mm,ss].map(function(x) {return x.toString().padStart(2,0);}).join(':'));
}

function getHash(data) {
  return data.split("").reduce(function(a,b) { a = ((a << 5) - a) + b.charCodeAt(0); return a&a; }, 0);
}
