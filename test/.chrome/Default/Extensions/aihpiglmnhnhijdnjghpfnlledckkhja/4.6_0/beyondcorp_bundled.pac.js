// $Id: //depot/google3/javascript/netmatcher/netmatcher.js#2 $
//
// JavaScript IPv4/IPv6 CIDR subnet matcher with no dependencies.
//
// For simplicity, IP addresses are represented using a list of 16-bit hextets,
// two for IPv4 and eight for IPv6.

var netmatcher = {};

(function() {

var HEXTET_BITS = 16;
var IPV4_PART_COUNT = 4;
var IPV6_PART_COUNT = 8;

netmatcher.isInNet = function(ip, net) {
  var ipHextets = netmatcher.parseIP(ip);
  var parsedNet = netmatcher.parseNetwork(net);
  var netHextets = parsedNet.hextets;
  var prefixlen = parsedNet.prefixlen;
  if (ipHextets.length != netHextets.length) {
    return false;  // IPv4/IPV6 mismatch.
  }
  // Compare full hextets.
  var i = 0;
  while (prefixlen >= HEXTET_BITS) {
    if (ipHextets[i] != netHextets[i]) {
      return false;
    }
    i++;
    prefixlen -= HEXTET_BITS;
  }
  if (prefixlen == 0) {
    return true;
  }
  // Compare up to 15 remaining bits.
  var mask = ~(0xFFFF >> prefixlen);
  return (ipHextets[i] & mask) == (netHextets[i] & mask);
};

netmatcher.parseNetwork = function(str) {
  var match = /^([^\/]+)\/([0-9]+)$/.exec(str);
  if (!match) {
    throw 'Bad CIDR string';
  }
  var hextets = netmatcher.parseIP(match[1]);
  var prefixlen = parseInt(match[2], 10);
  if (prefixlen > hextets.length * HEXTET_BITS) {
    throw 'Prefix too long';
  }
  return {hextets: hextets, prefixlen: prefixlen};
};

netmatcher.parseIP = function(str) {
  var parts = str.split(':');
  var lastPart = parts[parts.length - 1];
  if (lastPart.indexOf('.') >= 0) {
    var v4 = parseIPv4(lastPart);
    if (parts.length == 1) {
      // Plain IPv4 address, return two hextets.
      return v4;
    } else {
      // Convert dotted-quad suffix to hexadecimal.
      parts.pop();
      parts.push(v4[0].toString(16), v4[1].toString(16));
    }
  }
  if (!(3 <= parts.length && parts.length <= IPV6_PART_COUNT + 1)) {
    throw 'Bad hextet count';
  }
  var skipIndex = -1;
  for (var i = 1; i < parts.length - 1; i++) {
    if (parts[i].length == 0) {
      if (skipIndex >= 0) {
        throw 'Multiple ::';
      }
      skipIndex = i;
    }
  }

  var partsHi;
  var partsLo;
  if (skipIndex >= 0) {
    partsHi = skipIndex;
    partsLo = parts.length - skipIndex - 1;
    if (parts[0].length == 0 && --partsHi != 0) {
      throw '^: requires ^::';
    }
    if (parts[parts.length - 1].length == 0 && --partsLo != 0) {
      throw ':$ requires ::$';
    }
  } else {
    partsHi = parts.length;
    partsLo = 0;
  }

  var partsSkipped = IPV6_PART_COUNT - (partsHi + partsLo);
  if (!(skipIndex >= 0 ? partsSkipped >= 1 : partsSkipped == 0)) {
    throw 'Bad hextet count';
  }

  var hextets = [];
  for (var i = 0; i < partsHi; i++) {
    hextets.push(parseHextet(parts[i]));
  }
  for (var i = 0; i < partsSkipped; i++) {
    hextets.push(0);
  }
  for (var i = partsLo; i > 0; i--) {
    hextets.push(parseHextet(parts[parts.length - i]));
  }
  return hextets;
};

function parseIPv4(str) {
  var parts = str.split('.');
  if (parts.length != IPV4_PART_COUNT) {
    throw 'Bad octet count';
  }
  return [
    parseOctet(parts[0]) << 8 | parseOctet(parts[1]),
    parseOctet(parts[2]) << 8 | parseOctet(parts[3])
  ];
}

function parseOctet(str) {
  if (/^(0|[1-9][0-9]{0,2})$/.test(str)) {
    var value = parseInt(str, 10);
    if (value <= 255) {
      return value;
    }
  }
  throw 'Bad octet';
}

function parseHextet(str) {
  if (/^[0-9A-Fa-f]{1,4}$/.test(str)) {
    return parseInt(str, 16);
  }
  throw 'Bad hextet';
}

})();


// $Id: //depot/google3/corp/proxyconfig/js/pac.js#353 $
// PAC file served by Proxyconfig. Note that Proxyconfig, before serving
// this file, will actually bundle this with the needed utility functions,
// and do some other on-the-fly preprocessing to it. See the 'pac_generator.py'
// library for details.

//------------------------------------------------------------------------------

// Early declaration for constants that will be initialized on-the-fly by
// Proxyconfig (the initialization will be appended to the served PAC file).
var params;

//------------------------------------------------------------------------------

// Utility functions.

function StrToBool(str) {
  return /^\s*(1|true|y|yes)\s*$/i.test(str);
}

if (typeof(isInNetEx) != 'function') {
  function isInNetEx(ip, net) {
    return netmatcher.isInNet(ip, net);
  }
}

var isIP = {
  'valid': function(string) {
    try {
      netmatcher.parseIP(string);
    } catch (unused_error) {
      return false;
    }
    return true;
  },
  'local': function(ip) {
    return ip && (isInNetEx(ip, '::1/128') ||
                  isInNetEx(ip, '127.0.0.0/8'));
  },
  'prod': function(ip) {
    return ip && (isInNetEx(ip, '10.0.0.0/8')          ||
                  isInNetEx(ip, '2002:a00::/24')       || // Prod 6to4
                  isInNetEx(ip, '2404:6800:8000::/33') || // AP prod internal
                  isInNetEx(ip, '2607:f8b0:8000::/33') || // NA prod internal
                  isInNetEx(ip, '2800:3f0:8000::/33')  || // SA prod internal
                  isInNetEx(ip, '2a00:1450:8000::/33'));  // EU prod internal
  },
  'corp': function(ip) {
    return ip && (isInNetEx(ip, '172.16.0.0/12')  || // Corp IPv4 subnets
                  isInNetEx(ip, '192.168.0.0/16') || // Corp DMZ subnets
                  isInNetEx(ip, '100.64.0.0/10')  || // RFC6598 block for Corp
                  isInNetEx(ip, '2401:fa00::/32') ||
                  isInNetEx(ip, '2a00:79e0::/32') ||
                  isInNetEx(ip, '2620:15c::/36')  ||
                  isInNetEx(ip, '2620:0:1000::/40'));
  },
  'public': function(ip) {
     return (ip && !(this.corp(ip) || this.prod(ip) || this.local(ip)));
  }
};

function NormalizeHost(host) {
  // The host might actually be an IPv6 address, so this is a little
  // trickier than one might expect.
  var match = (/^\[(.*)\](:[0-9]+)?$/.exec(host) ||
               /^([^:]*):[0-9]+$/.exec(host));
  if (match) {
    return match[1];
  } else {
    return host;
  }
}

// Extract the protocol part from the given URL, and return it as an
// upper-case string. Return 'null' if the URL is invalid. Examples:
// - "http://foo" -> "HTTP"
// - "https://cnn.com" -> "HTTPS"
// - "file:///home/slattarini/file.txt" -> "FILE"
// - "/home/slattarini/file.txt" -> null
function ExtractProtocolFromURL(url) {
  var match = /^([\w]+):\/\//.exec(url);
  return match ? match[1].toUpperCase() : null;
}

// This function is needed to implement the feature described in
// http://g3doc/corp/proxyconfig/g3doc/user-docs/user-customizations#proxy-per-host
//
// It parses a string STR expected to have the following form, expressed in
// pseudo-EBNF:
//
//   STR := ["|"] MAP { "|" MAP } ["|"]
//   MAP := HOSTNAME "->" PROXY | PROTO "->" HOSTNAME "->" PROXY
//
// It's quite tolerant about invalid syntax, splitting over '|' and then
// ignoring any invalid entry.
//
// It return a list of objects with one of these specs:
//   { 'host': "...", 'proxy': "..." }
//   { 'proto': "...", 'host': "...", 'proxy': "..." }
//
// See the unittests in 'pac_utils_test.js' for example results.
//
function ParseHostToProxyMap(str) {
  var result = [];
  var strings = str.split('|');
  for (var i = 0; i < strings.length; i++) {
    var t = strings[i].split('->');
    switch (t.length) {
      case 2:
        result.push({
          'host': t[0],
          'proxy': t[1]
        });
        break;
      case 3:
        result.push({
          'proto': t[0].toUpperCase(),
          'host': t[1],
          'proxy': t[2]
        });
        break;
      default:
        /* unexpected format; just skip */
        break;
    }
  }
  return result;
}

function CustomDnsResolve(host) {
  // We need to mock some data for our unittests. Sorry!
  if (params.is_testing) {
    switch (host) {
      case 'ma.t-mobile.com':
        return '10.176.2.244';  // b/16174010
        break;
      case 'cache.facebook.com':
        return '172.16.255.9';
        break;
      case 'marcovaldo.dub':
      case 'marcovaldo.dub.corp.google.com':
        return '172.16.17.18';
        break;
    }
  }
  var host_ip;
  if (typeof(dnsResolveEx) == 'function') {
    // In some browsers, dnsResolve() is restricted to IPv4 addresses.
    // Simulate Firefox's dnsResolve().
    var ip_list = dnsResolveEx(host);
    if (ip_list) {
      // Use the first address.
      host_ip = ip_list.split(';')[0];
    }
  } else {
     host_ip = dnsResolve(host);
  }
  // Some browsers might return 'null' on failed DNS lookups, some might
  // return 'false'. And I wouldn't be surprised to find browsers which
  // return the empty string. So normalize the return value for a failed
  // DNS lookup to 'undefined'. See b/25820076 for more info.
  return host_ip ? host_ip : undefined;
}

//------------------------------------------------------------------------------

// Some common constants.

// Application-level protocols.
var HTTP = 'HTTP';
var HTTPS = 'HTTPS';
var WS = 'WS';
var WSS = 'WSS';

// Proxies.
var SEND_DIRECT = 'DIRECT';
var SEND_TO_EGRESSPROXY = 'PROXY egressproxy.corp.google.com:3128;';
// See http://b/26919272#comment45 onwards for the reasons of this abomination.
// var SEND_TO_DL_PROXY = 'PROXY digital-libraries-proxy.corp.google.com:3128;';
var SEND_TO_DL_PROXY = 'PROXY egressproxy.corp.google.com:3128;';
var SEND_TO_UBERPROXY = 'HTTPS l2-uberproxy.corp.google.com:443;';
// Might actually be rewritten to send stuff to the egress proxy.
var DEFAULT_ROUTE = null;

// Site specific locations and Google-specific Corp DNS zones.
//
// Use:
//   $ cdb zone show ${ZONE}.corp.google.com
// to get details on each of these.
//
// How this list was generated:
//   python corp/proxyconfig/fetch_corp_pac_zones.py
//
var GOOGLE_CORP_SUBDOMAINS = [
  ".aao",
  ".aar",
  ".acc",
  ".akl",
  ".amd",
  ".ame",
  ".arb",
  ".ast",
  ".ath",
  ".atl",
  ".atw",
  ".aus",
  ".bej",
  ".ber",
  ".bev",
  ".bhz",
  ".bkk",
  ".bld",
  ".blr",
  ".bna",
  ".bog",
  ".bpd",
  ".brd",
  ".bru",
  ".bue",
  ".buh",
  ".cai",
  ".cam",
  ".cbf",
  ".cgk",
  ".cha",
  ".chi",
  ".chl",
  ".chs",
  ".cib",
  ".clt",
  ".cnc",
  ".conf",
  ".cph",
  ".cpk",
  ".dal",
  ".ddf",
  ".del",
  ".det",
  ".dls",
  ".dtw",
  ".dub",
  ".dus",
  ".dxb",
  ".eem",
  ".enterprise",
  ".ffm",
  ".fra",
  ".ghl",
  ".grq",
  ".gur",
  ".ham",
  ".hel",
  ".her",
  ".hfa",
  ".hkd",
  ".hkg",
  ".hot",
  ".hyd",
  ".i",
  ".irv",
  ".jnb",
  ".kci",
  ".kie",
  ".kir",
  ".kla",
  ".krk",
  ".krp",
  ".kul",
  ".lag",
  ".lal",
  ".lax",
  ".lbc",
  ".ldaps",
  ".lex",
  ".lga",
  ".lhr",
  ".lim",
  ".lis",
  ".lmr",
  ".lnr",
  ".lon",
  ".lpp",
  ".lul",
  ".lvk",
  ".lyo",
  ".mad",
  ".mcast",
  ".mel",
  ".mev",
  ".mex",
  ".mirror",
  ".mnk",
  ".mnl",
  ".mon",
  ".mor",
  ".msk",
  ".msn",
  ".mtv",
  ".muc",
  ".muo",
  ".n",
  ".nbo",
  ".nfs",
  ".nrt",
  ".nyt",
  ".oib",
  ".orl",
  ".osa",
  ".osl",
  ".ott",
  ".oul",
  ".pao",
  ".par",
  ".pco",
  ".pdx",
  ".phl",
  ".pit",
  ".pkf",
  ".plv",
  ".pos",
  ".prg",
  ".prh",
  ".printer",
  ".prom",
  ".pry",
  ".pst",
  ".pvu",
  ".rdu",
  ".res",
  ".rns",
  ".roam",
  ".rol",
  ".rom",
  ".san",
  ".sao",
  ".sba",
  ".sbo",
  ".scl",
  ".sea",
  ".seo",
  ".sfo",
  ".sha",
  ".sin",
  ".sjc",
  ".slc",
  ".smo",
  ".spb",
  ".ssf",
  ".sto",
  ".svl",
  ".syd",
  ".thn",
  ".tlv",
  ".tok",
  ".tor",
  ".tpe",
  ".tri",
  ".tst",
  ".twd",
  ".unittests",
  ".vie",
  ".vm",
  ".vno",
  ".was",
  ".wat",
  ".waw",
  ".wlm",
  ".wro",
  ".ytspaces",
  ".zbc",
  ".zrh"
];

// Short forms must exclude any valid TLD.
var GOOGLE_PROD_HOST_RX = (
    /.\.((adz|borg|cboo|dclk|jail|ls|prodz?)(\.google\.com)?|net\.google\.com|googleprod\.com)$/);

// Proxy for Digital Libraries (b/8716754). Yes, they do authN/authZ
// based on the egress IP address. Sigh.
// Do not add any new digital libraries here; we are actively migrating
// the existing ones away from IP whitelisting (http://b/hotlists/334577)
var DIGITAL_LIBRARIES_HOSTS = [
  /(^|.\.)jstor\.org$/,
  /(^|.\.)acm\.org$/,
  /(^|.\.)ieee\.org$/,
  /(^|.\.)springer(link)?\.com$/
];

// China, to avoid issues with the GFW or (sometimes) just general
// slowness (tick/9545911). See b/23474779 for more context.
var CHINA_PROBLEMATIC_HOSTS = [
  {
    host: /^camp\.service-now\.com$/,
    bug: 'b/10329324',
    description: 'Faster via proxy than via Chinese ISP (had 17% packet loss)'
  },
  {
    host: /^www\.concursolutions\.com$/,
    bug: 'b/13682974',
    description: 'Got up to 60% packet loss via local Chinese ISP'
  },
  {
    host: /^stockplanconnect\.morganstanley\.com$/,
    bug: 'b/13682974, tick/14771465',
    description: 'Got up to 60% packet loss via local Chinese ISP'
  },
  {
    host: /^wd5\.myworkday\.com$/,
    bug: 'tick/12790644',
    description: 'Workday was too slow from the China office'
  },
  {
    host: /^hoteldirectory\.lanyon\.com$/,
    bug: 'b/26151729, tick/17328159',
    description: 'Poor accessibility from China'
  }
];

// See go/facilities-nets-2015-the-present-and-the-future
var FACILITIES_NETS = [
  {
    subnets: [
        '10.247.0.0/18',
        '10.247.128.0/17',
        '10.247.112.0/21'
    ],
    description: 'Hosts in the Facilities Nets have to go direct',
    bug: 'b/17812041, go/facilities-nets-2015-the-present-and-the-future'
  },
  {
    host: /(^dcops-.*-[bp]ms[tw]\.prod)(\.google\.com)?$/,
    description: 'Hosts in the Facilities Nets have to go direct',
    bug: 'b/21605033, go/facilities-nets-2015-the-present-and-the-future'
  },
  {
    host: /(.-cooling.*|^pmg\d+\.\w+)\.net\.google\.com$/,
    description: 'Direct access to FacNets cooling and power metering devices',
    bug: 'b/23379777, go/facilities-nets-2015-the-present-and-the-future'
  }
];

// Stuff that needs to go DIRECT because it's incompatible with BeyondCorp:
// - Corp HTTP backends that are incompatible with Uberproxy-FP;
// - Corp HTTPS backends that are not behind Uberproxy;
// - Corp backends that are behind Uberproxy but also made available DIRECT
//   for people on-Corp ad an optimization (e.g., x20web-anycast)
// - Corp backends that use WebSockets.
var CORP_APPS_TO_GO_DIRECT = [

    /** Any protocol. **/
    {
      description: 'x20 anycast address',
      subnets: ['172.16.255.48/31'],
      bug: 'b/13337642'
    },
    {
      description: 'x20 IPv6 anycast address',
      subnets: ['2401:fa00:fa::48/127'],
      bug: 'b/13337642'
    },
    {
      host: /^appcat(\.corp\.google\.com)?$/,
      description: 'SCCM 2012 App Cat.'
    },
    {
      host: /^nls-anycast(\.corp\.google\.com)?$/,
      description: 'Direct Access NLS.',
      bug: 'b/17914614'
    },
    {
      description: 'Shiny/Poly (go/grassy)',
      host: /^polyc(|\.corp\.google\.com)$/,
      bug: 'b/12885884, b/19079031'
    },
    {
      host: /^(winapps|citrix-receiver-anycast)(|\.corp\.google\.com)$/,
      bug: 'b/19187683, b/19233019'
    },
    // TODO(slattarini): now that we send HTTPS-to-Corp DIRECT by default,
    // remove from this list all apps that do no use HTTP.
    {
      host: /^(test-)?(irc|cgiirc)(\.corp\.google\.com)?$/,
      description: 'Web IRC goes direct.',
      bug: 'b/7476352'
    },
    {
      host: /^irc[0-9]+-[0-9]+\.([A-Za-z]{3})(\.corp\.google\.com)?$/,
      description: 'Web IRC goes direct.',
      bug: 'b/7476352'
    },
    {
      host: /^(corp-speedtest\.i|speedtest(|2)-(mtv\.mtv|dls\.dls|eem\.eem|fra\.fra|twd\.twd|hot\.hot|cbf\.cbf))(\.corp\.google\.com)?$/,
      description: 'Send request to speedtest servers direct',
      bug: 'tick/6416072'
    },
    {
      host: /^(ccure|norcal|google|datacenter|emearestricted|emea|apac|dev|americas)-(badging|sas)-[1-3]\.corp\.google\.com$/,
      description: 'Does not work nicely with Corp Proxy',
      bug: 'b/6946866'
    },

    /** HTTP **/
    {
      host: /^vmgws02(47|48|49|50|51|52)(\.ad\.corp\.google\.com)?$/,
      description: 'SCCM 2012 has issues to go via Uberproxy',
      bug: 'b/28791842'
    },
    {
      description: 'AML RCM DEV',
      host: /^(aml-prod-web|rcm-dev\.(hot|vm)|wpby12\.hot|vmgol(0015|0195|235)\.vm)(|\.corp\.google\.com)$/,
      proto: HTTP,
      bug: 'b/19100292'
    },
    {
      description: 'MES Application (based on .NET Remoting)',
      host: /^mes-(x-(dev|uat|prod)|(loon|makani|iris)-prod)-app(|\.corp\.google\.com)$/,
      proto: HTTP,
      bug: 'b/19550118'
    },
    {
      description: 'GFiber Oracle Primavera P6',
      host: /^primavera-(prod|uat|sbx|dev)-app01(|\.corp\.google\.com)$/,
      proto: HTTP,
      bug: 'b/19443666'
    },
    {
      description: 'Catia/Enovia Application',
      host: /^chauffeur-plm-.*\.(mtv|vm)(|\.corp\.google\.com)$/,
      proto: HTTP,
      bug: 'b/19181710'
    },
    {
      description: 'MapInfo (used by NetOps FND)',
      // TODO(rdpierce): we should not need the explicit presence of the
      // backend servers here.
      host: /^(nc-map1\.hot|nc-map2\.cbf|wpdc20\.hot|kpdm10\.cbf)(|\.corp\.google\.com)$/,
      proto: HTTP,
      bug: 'b/19206914'
    }
];

//------------------------------------------------------------------------------

// Helper functions.

function MakeProxyInsecure(proxy_list_str) {
  return proxy_list_str.replace(
      /\bHTTPS(\s+)(\S+):443\b/g, 'PROXY$1$2:80');
}

function IsInOneOfDnsDomains(host, list) {
  for (var i = 0; i < list.length; i++) {
    if (dnsDomainIs(host, list[i])) {
      return true;
    }
  }
  return false;
}

function IsInSiteSpecificLocation(host) {
  return IsInOneOfDnsDomains(host, GOOGLE_CORP_SUBDOMAINS);
}

function IsInAnyOfNetworkSubnets(ip, subnets) {
  for (var i = 0; i < subnets.length; i++) {
    if (isInNetEx(ip, subnets[i])) {
      return true;
    }
  }
  return false;
}

function MatchesAnyString(tested, expected) {
  if (typeof(expected) == 'string') {
    expected = [expected];
  }
  for (var i = 0; i < expected.length; i++) {
    if (tested == expected[i]) {
      return true;
    }
  }
  return false;
}

function RequestMatches(request, spec) {
  // It's OK if the spec is a regex; in that case, we assume we want to match
  // against the host (since that is indeed the most common occurrence).
  if (typeof(spec.test) == 'function') {
    return spec.test(request.host);
  }
  if (spec.proto && !MatchesAnyString(request.proto, spec.proto)) {
    return false;
  }
  if (spec.url && !spec.url.test(request.url)) {
    return false;
  }
  if (spec.host && !spec.host.test(request.host)) {
    return false;
  }
  if (spec.subnets) {
    if (!request.real_ip) {
      return false;
    } else if (!IsInAnyOfNetworkSubnets(request.real_ip, spec.subnets)) {
      return false;
    }
  }
  return true;
}

function RequestMatchesAny(request, specs) {
  for (var i = 0; i < specs.length; i++) {
    if (RequestMatches(request, specs[i])) {
      return true;
    }
  }
  return false;
}

// Avoid mistaking IPv6 addresses for plain hostnames (b/17015728).
// This is needed for at least Chrome (36.0.1985.143), while Firefox (31.0)
// seems to work correctly.
// Luckily, this Chrome bug/limitation is shared by the 'pacparser' library
// we use in our tests, so we are able to expose the issue in the testsuite.
function IsPlainHostName(host) {
  return !isIP.valid(host) && isPlainHostName(host);
}

function IsCorpHostName(host) {
  return /.\.corp\.google\.com$/.test(host);
}

function IsPlainOrCorpHostName(host) {
  return IsPlainHostName(host) || IsCorpHostName(host);
}

function LooksLikeGoogleCorpProperty(request) {
  return (isIP.corp(request.literal_ip) ||
          IsCorpHostName(request.host) ||
          IsInSiteSpecificLocation(request.host));
}

function LooksLikeGoogleProdProperty(request) {
  return (isIP.prod(request.literal_ip) ||
          GOOGLE_PROD_HOST_RX.test(request.host));
}

function LooksLikeGoogleInternalProperty(request) {
  return (IsPlainHostName(request.host) ||
          LooksLikeGoogleProdProperty(request) ||
          LooksLikeGoogleCorpProperty(request));
}

// These functions are only used to avoid sending needless traffic to proxies
// like Polyjuice and the Egress Proxy (see the comments in the function's
// only call site for more details). So it doesn't need to offer complete
// coverage; an "80% solution" is perfectly fine. Anyway, for reference,
// google3/googledata/production/dns/external/domainlist and the files it
// includes should have a pretty comprehensive list of Google-owned domains.
var MustGoDirect = {};

(function() {

  var TLDS = '(com|(com?\\.)?([a-z][a-z]|cat))';
  // Do not blindly add more domains here; for example, Polyjuice's users must
  // cloak to examine ads embedded on YouTube and Blogger, so we cannot have
  // 'youtube' nor 'blogger' in here.
  // .  TODO(slattarini,ahedberg,b/28784985): link to a canonical list.
  var GOOGLE_DOMAINS_FOR_TLDS = '(google|googlemail|gmail)';
  var GOOGLE_CORP_DOMAINS_FOR_TLDS = 'corp\\.google';
  var GOOGLE_DOMAINS_FOR_COM = '(postini|itasoftware|deepmind)';
  var LEGACY_DOMAINS = '(sandbox|ext)';  // TODO(slattarini): still needed?

  var POLYJUICE_RX = RegExp(
      '(^|.\\.)(' +
      GOOGLE_DOMAINS_FOR_TLDS + '\\.' + TLDS +
      '|' +
      GOOGLE_DOMAINS_FOR_COM + '\\.com' +
      '|' +
      LEGACY_DOMAINS +
      ')$');

  // Some of Google public sites still have potential, "flaky" issues when
  // reached directly from China offices, so we need to allow the users to
  // send them to the Egress Proxy when China Connectivity mode in on. See
  // commit message of CL/122712218 for even more details.
  var EGRESSPROXY_RX = RegExp(
      '(^|.\\.)(' +
      GOOGLE_CORP_DOMAINS_FOR_TLDS + '\\.' + TLDS +
      '|' +
      LEGACY_DOMAINS + '(\\.google\\.com)?' +
      ')$');

  MustGoDirect.for_egressproxy = function(host) {
    return EGRESSPROXY_RX.test(host);
  };

  MustGoDirect.for_polyjuice = function(host) {
    return POLYJUICE_RX.test(host);
  };

})();

function ProcessParameters() {
  var boolean_params = [
    'activate_beyondcorp_extension',  // b/15474073
    'activate_china_proxy_toggle',  // b/17649614
    'disable_uberproxy_fp_to_corp',  // go/http-to-corp-via-uberproxy-fp
    'user_ip_tagged_in_china',  // b/23474779
    'is_testing',  // whether to tweak some behaviours for unittests
    'send_http_to_facilities_nets_via_uberproxy_fp', // b/23341536
    'use_uberproxy_as_https_proxy' // b/22713062
  ];
  for (var i = 0; i < boolean_params.length; i++) {
    params[boolean_params[i]] = StrToBool(params[boolean_params[i]]);
  }
  if (params.uberproxy_panic) {
    // b/25682367: allow use of local Uberproxy. Notice that we *deliberately*
    // don't want this to be an HTTPS proxy (as 'localhost' or '127.0.0.1' will
    // obviously not match the SAN/SNI list of the Uberproxy cert).
    SEND_TO_UBERPROXY = 'PROXY ' + params.uberproxy_panic + ';';
  } else if (!params.use_uberproxy_as_https_proxy) {
    // b/22713062
    SEND_TO_UBERPROXY = MakeProxyInsecure(SEND_TO_UBERPROXY);
  }
}

//------------------------------------------------------------------------------

// Corp network (China and non-China, MPC and MNP) and VPN.

function FindProxyForCorpNet(request) {

  if (params.user_ip_tagged_in_china &&
      RequestMatchesAny(request, CHINA_PROBLEMATIC_HOSTS)) {
    return SEND_TO_EGRESSPROXY;
  }

  if (RequestMatchesAny(request, FACILITIES_NETS)) {
    if (params.send_http_to_facilities_nets_via_uberproxy_fp &&
        request.proto == HTTP) {
      return SEND_TO_UBERPROXY;
    } else {
      return SEND_DIRECT;
    }
  } else if (RequestMatchesAny(request, CORP_APPS_TO_GO_DIRECT)) {
    return SEND_DIRECT;
  } else if (RequestMatchesAny(request, DIGITAL_LIBRARIES_HOSTS)) {
    return SEND_TO_DL_PROXY;
  }

  // Opt-out described in http://go/http-to-corp-via-uberproxy-fp must
  // still be supported :-(
  if (request.proto == HTTP && LooksLikeGoogleCorpProperty(request)) {
    return (params.disable_uberproxy_fp_to_corp ? SEND_DIRECT :
                                                  SEND_TO_UBERPROXY);
  }

  // Some stuff in Corp or Prod might be whitelisted to be reached DIRECT
  // from the Corp network (or subset thereof). Make sure we don't try to
  // send HTTPS traffic to such properties via the Egress Proxy, as that
  // would break such exceptions. On the other hand, HTTP traffic that
  // does not go to any of the whitelisted hosts or subnets we've handled
  // above should go via Uberproxy-FP.
  if (LooksLikeGoogleInternalProperty(request)) {
    return request.proto == HTTP ? SEND_TO_UBERPROXY : SEND_DIRECT;
  }

  return DEFAULT_ROUTE;
}

//------------------------------------------------------------------------------

// Function for the PAC file served to the BeyondCorp extension and Android.

function FindProxyForBeyondCorp(request) {
  if (request.proto == HTTP && LooksLikeGoogleInternalProperty(request)) {
    return SEND_TO_UBERPROXY;
  }
  return DEFAULT_ROUTE;
}

//------------------------------------------------------------------------------

// Default dumb proxy configuration: send everything direct, but try to
// send short hostnames to Uberproxy.

function FindProxyMinimal(request) {
  if (request.proto == HTTP) {
    var host = request.host;
    // We can't send plain hostnames to Uberproxy unconditionally, since
    // we still want to support users on external networks that have short
    // hostnames that resolve in their LAN -- we need to do so here since
    // the external PAC file implemented by this function is served by
    // default, not by a browser extension, so there is no UX-friendly way
    // to temporarily disable it.
    // So, while in general over-reliance on DNS resolution is bad in PAC
    // files (as experience has shown us), in this particular, restricted
    // case it is desirable, almost necessary.
    if (IsPlainHostName(host) && !CustomDnsResolve(host)) {
      host = host.concat('.corp.google.com');
    }
    if (IsCorpHostName(host) && isIP.public(CustomDnsResolve(host))) {
      return SEND_TO_UBERPROXY;
    }
  }
  return DEFAULT_ROUTE;
}

//------------------------------------------------------------------------------

function FindProxyForRequest(request) {

  var proxy_finder_func = FindProxyMinimal;
  var activate_china_proxy_toggle = false;
  var internal_dns = false;

  switch (params.pac) {
    case 'internal':
      internal_dns = true;
      activate_china_proxy_toggle = params.activate_china_proxy_toggle;
      proxy_finder_func = FindProxyForCorpNet;
      break;
    case 'external':
      if (params.activate_beyondcorp_extension) {
        proxy_finder_func = FindProxyForBeyondCorp;
      }
      break;
    case 'android':
      proxy_finder_func = FindProxyForBeyondCorp;
      break;
    default:
      break;  // unknown PAC file, we'll fall back to dumb basic behavior
  }

  if (params.map_to_proxy) {
    // Allow user customization: they can tell to send a 'host:proto' combination
    // to a given proxy; see b/27566403 for details, and documentation at
    // http://g3doc/corp/proxyconfig/g3doc/user-docs/user-customizations#proxy-per-host
    var map_to_proxy = ParseHostToProxyMap(params.map_to_proxy);
    for (var i = 0; i < map_to_proxy.length; i++) {
      var obj = map_to_proxy[i];
      if (request.host != obj.host)
        continue;
      if (obj.proto && request.proto != obj.proto)
        continue;
      return obj.proxy;
    }
  }

  // Send requests to localhost direct (hostname-based decision).
  switch (request.host) {
    case 'localhost':
    case 'ip6-localhost':
    case 'ip6-loopback':
      return SEND_DIRECT;
      break;
    // These always resolve in 127.0.0.1 or ::1 in Corp DNS.
    // Optimize this special case.
    case 'localhost.corp.google.com':
    case 'localhost6.corp.google.com':
    case 'ip6-localhost.corp.google.com':
      if (internal_dns) {
        return SEND_DIRECT;
      }
      break;
  }

  if (dnsDomainIs(request.host, '.googleplex.com')) {
    return (request.proto == HTTP ? SEND_TO_UBERPROXY : SEND_DIRECT);
  }

  // In internal DNS, short hostnames and *.corp hostnames can be resolve to
  // internal address that might need to be sent direct (think x20web-anycast).
  // Also, *.corp.google.com hostnames and *.${site} hostnames (e.g., foo.mtv,
  // mydesktop.dub, etc) can resolve to the localhost, a fact that we want to
  // use in later decisions.
  if (internal_dns) {
    if (IsPlainOrCorpHostName(request.host) ||
        IsInSiteSpecificLocation(request.host)) {
      request.real_ip = CustomDnsResolve(request.host);
    }
  }

  // Send requests to localhost direct (IP-based decisions).
  if (request.real_ip) {
    if (isIP.local(request.real_ip) ||
        // We need this to support things like local borgmons, which can
        // rewrite URLs to their own pages using the FQDN of the local host.
        // But on external network, we don't trust DNS to tell us what our
        // IP is. Not a big deal, since nobody should be running borgmons
        // or any other Google3 binary on their laptops anyway.
        (internal_dns && request.real_ip == params.myip)) {
      return SEND_DIRECT;
    }
  }

  var route = proxy_finder_func(request);
  if (route != DEFAULT_ROUTE) {
    return route;
  }

  // If we are here, we might want to go though a fallthrough proxy or DIRECT.
  //
  // We try not to send traffic toward Google domains via a proxy, unless
  // needed. Rationales:
  //
  // (1) On internal network, that can break things like /statusz (and
  //     other /*z handlers) which require a debug IP.
  //
  // (2) On external networks, that can cause extra traffic to needlessly
  //     go to privacy/cloaking proxies, causing no gains and burning
  //     their bandwidth (more details at http://b/27714295#comment2).
  //
  // (3) On internal networks of offices which have to use an egress proxy
  //     to access third-party sites, reduce bandwidth on said proxies by
  //     not needlessly sending also Google-owned sites to it (the Prod
  //     VIPs are reachable directly from Corp without having to egress
  //     to the public internet first).

  // Integration of Gleeok v2 ("Polyjuice") with proxyconfig; b/26189179.
  if (params.polyjuice_proxy &&
      !MustGoDirect.for_polyjuice(request.host)) {
    return params.polyjuice_proxy;
  }

  // Implementation of "China Connectivity" knob in the BeyondCorp extension.
  // http://g3doc/corp/access/http_proxy/g3doc/user-docs/overview#egressproxy
  // http://g3doc/corp/proxyconfig/g3doc/team-docs/overviews/pac-files-gory-details#china-toggle
  if (activate_china_proxy_toggle &&
      !MustGoDirect.for_egressproxy(request.host)) {
    return SEND_TO_EGRESSPROXY;
  }

  return SEND_DIRECT;
}

//------------------------------------------------------------------------------

// This is the function invoked by the browser on every request.
// It returns the proxy that should be used, or "DIRECT" if no
// proxy should be used.
function FindProxyForURL(url, host) {

  ProcessParameters();

  // We need to mock some data for our unittests. Sorry!
  if (params.is_testing && url == 'http://is-beyondcorp?') {
    return params.activate_beyondcorp_extension ? 'YES' : 'NO';
  }

  host = NormalizeHost(host);

  // Bail out immediately for phishing sites (b/13627406). This must go
  // before *everything* else. It must also go before we try to lookup
  // the host's IP address, as doing so for this domains triggers alerts
  // for the security guys (b/16181659).
  if (/^login\.corp\.google\.com./.test(host)) {
    return SEND_TO_UBERPROXY;
  }

  // It's often not safe nor desirable to rely unconditionally on DNS
  // resolution, in both external or internal networks (see at least
  // b/16174010, b/17814018 and b/22288891 for details). So we distinguish
  // between an IP obtained by only analyzing the hostname (and set that IP
  // as "null" if there is not enough information to actually get it) and
  // an IP obtained doing a real DNS resolution. The latter will only be
  // obtained in the few case in which it can be useful; the details are
  // in FindProxyForRequest().
  var literal_ip = isIP.valid(host) ? host : null;

  var proto = ExtractProtocolFromURL(url);

  // It's handier to have all this info pre-processed in a single object
  // rather than scattered in several parameters  We can then delegate
  // all the real work to functions that operate on this object.
  var request = {
    url: url,
    host: host,
    proto: proto,
    literal_ip: literal_ip,
    real_ip: literal_ip,  // this might be modified later!
    is_ssl: (proto == HTTPS || proto == WSS)
  };

  return FindProxyForRequest(request);
}



var params = {
  "activate_beyondcorp_extension": "true", 
  "myip": "127.0.0.1", 
  "user_ip_tagged_in_china": "false", 
  "pac": "external", 
  "use_uberproxy_as_https_proxy": "true"
};
