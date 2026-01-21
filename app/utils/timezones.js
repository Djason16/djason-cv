// Complete list of IANA timezones for 195+ countries worldwide
// One primary timezone per country

export const timezones = [
    'UTC',

    // ============================================
    // AFRICA (54 countries)
    // ============================================
    'Africa/Abidjan',        // Ivory Coast
    'Africa/Accra',          // Ghana
    'Africa/Addis_Ababa',    // Ethiopia
    'Africa/Algiers',        // Algeria
    'Africa/Antananarivo',   // Madagascar
    'Africa/Asmara',         // Eritrea
    'Africa/Bamako',         // Mali
    'Africa/Bangui',         // Central African Republic
    'Africa/Banjul',         // Gambia
    'Africa/Bissau',         // Guinea-Bissau
    'Africa/Blantyre',       // Malawi
    'Africa/Brazzaville',    // Congo
    'Africa/Bujumbura',      // Burundi
    'Africa/Cairo',          // Egypt
    'Africa/Casablanca',     // Morocco
    'Africa/Conakry',        // Guinea
    'Africa/Dakar',          // Senegal
    'Africa/Dar_es_Salaam',  // Tanzania
    'Africa/Djibouti',       // Djibouti
    'Africa/Douala',         // Cameroon
    'Africa/Freetown',       // Sierra Leone
    'Africa/Gaborone',       // Botswana
    'Africa/Harare',         // Zimbabwe
    'Africa/Johannesburg',   // South Africa
    'Africa/Juba',           // South Sudan
    'Africa/Kampala',        // Uganda
    'Africa/Khartoum',       // Sudan
    'Africa/Kigali',         // Rwanda
    'Africa/Kinshasa',       // Democratic Republic of the Congo
    'Africa/Lagos',          // Nigeria
    'Africa/Libreville',     // Gabon
    'Africa/Lome',           // Togo
    'Africa/Luanda',         // Angola
    'Africa/Lusaka',         // Zambia
    'Africa/Malabo',         // Equatorial Guinea
    'Africa/Maputo',         // Mozambique
    'Africa/Maseru',         // Lesotho
    'Africa/Mbabane',        // Eswatini
    'Africa/Mogadishu',      // Somalia
    'Africa/Monrovia',       // Liberia
    'Africa/Moroni',         // Comoros
    'Africa/Nairobi',        // Kenya
    'Africa/Ndjamena',       // Chad
    'Africa/Niamey',         // Niger
    'Africa/Nouakchott',     // Mauritania
    'Africa/Ouagadougou',    // Burkina Faso
    'Africa/Port_Louis',     // Mauritius
    'Africa/Porto-Novo',     // Benin
    'Africa/Praia',          // Cabo Verde
    'Africa/Sao_Tome',       // Sao Tome and Principe
    'Africa/Tripoli',        // Libya
    'Africa/Tunis',          // Tunisia
    'Africa/Windhoek',       // Namibia

    // ============================================
    // NORTH AMERICA (3 countries)
    // ============================================
    'America/Toronto',       // Canada
    'America/Mexico_City',   // Mexico
    'America/New_York',      // United States

    // ============================================
    // CENTRAL AMERICA (7 countries)
    // ============================================
    'America/Belize',        // Belize
    'America/San_Jose',      // Costa Rica
    'America/San_Salvador',  // El Salvador
    'America/Guatemala',     // Guatemala
    'America/Tegucigalpa',   // Honduras
    'America/Managua',       // Nicaragua
    'America/Panama',        // Panama

    // ============================================
    // CARIBBEAN (13 countries)
    // ============================================
    'America/Antigua',       // Antigua and Barbuda
    'America/Nassau',        // Bahamas
    'America/Barbados',      // Barbados
    'America/Havana',        // Cuba
    'America/Dominica',      // Dominica
    'America/Santo_Domingo', // Dominican Republic
    'America/Grenada',       // Grenada
    'America/Port-au-Prince',// Haiti
    'America/Jamaica',       // Jamaica
    'America/St_Kitts',      // Saint Kitts and Nevis
    'America/St_Lucia',      // Saint Lucia
    'America/St_Vincent',    // Saint Vincent and the Grenadines
    'America/Port_of_Spain', // Trinidad and Tobago

    // ============================================
    // SOUTH AMERICA (13 countries)
    // ============================================
    'America/Buenos_Aires',  // Argentina
    'America/La_Paz',        // Bolivia
    'America/Sao_Paulo',     // Brazil
    'America/Santiago',      // Chile
    'America/Bogota',        // Colombia
    'America/Guayaquil',     // Ecuador
    'America/Cayenne',       // French Guiana
    'America/Guyana',        // Guyana
    'America/Asuncion',      // Paraguay
    'America/Lima',          // Peru
    'America/Paramaribo',    // Suriname
    'America/Montevideo',    // Uruguay
    'America/Caracas',       // Venezuela

    // ============================================
    // ASIA (47 countries)
    // ============================================
    'Asia/Kabul',            // Afghanistan
    'Asia/Yerevan',          // Armenia
    'Asia/Baku',             // Azerbaijan
    'Asia/Manama',           // Bahrain
    'Asia/Dhaka',            // Bangladesh
    'Asia/Thimphu',          // Bhutan
    'Asia/Brunei',           // Brunei
    'Asia/Phnom_Penh',       // Cambodia
    'Asia/Shanghai',         // China
    'Asia/Tbilisi',          // Georgia
    'Asia/Kolkata',          // India
    'Asia/Jakarta',          // Indonesia
    'Asia/Tehran',           // Iran
    'Asia/Baghdad',          // Iraq
    'Asia/Jerusalem',        // Israel
    'Asia/Tokyo',            // Japan
    'Asia/Amman',            // Jordan
    'Asia/Almaty',           // Kazakhstan
    'Asia/Kuwait',           // Kuwait
    'Asia/Bishkek',          // Kyrgyzstan
    'Asia/Vientiane',        // Laos
    'Asia/Beirut',           // Lebanon
    'Asia/Kuala_Lumpur',     // Malaysia
    'Asia/Male',             // Maldives
    'Asia/Ulaanbaatar',      // Mongolia
    'Asia/Yangon',           // Myanmar
    'Asia/Kathmandu',        // Nepal
    'Asia/Pyongyang',        // North Korea
    'Asia/Muscat',           // Oman
    'Asia/Karachi',          // Pakistan
    'Asia/Gaza',             // Palestine
    'Asia/Manila',           // Philippines
    'Asia/Qatar',            // Qatar
    'Asia/Riyadh',           // Saudi Arabia
    'Asia/Singapore',        // Singapore
    'Asia/Seoul',            // South Korea
    'Asia/Colombo',          // Sri Lanka
    'Asia/Damascus',         // Syria
    'Asia/Taipei',           // Taiwan
    'Asia/Dushanbe',         // Tajikistan
    'Asia/Bangkok',          // Thailand
    'Asia/Dili',             // East Timor
    'Asia/Ashgabat',         // Turkmenistan
    'Asia/Dubai',            // United Arab Emirates
    'Asia/Tashkent',         // Uzbekistan
    'Asia/Ho_Chi_Minh',      // Vietnam
    'Asia/Aden',             // Yemen

    // ============================================
    // EUROPE (47 countries)
    // ============================================
    'Europe/Tirane',         // Albania
    'Europe/Andorra',        // Andorra
    'Europe/Vienna',         // Austria
    'Europe/Minsk',          // Belarus
    'Europe/Brussels',       // Belgium
    'Europe/Sarajevo',       // Bosnia and Herzegovina
    'Europe/Sofia',          // Bulgaria
    'Europe/Zagreb',         // Croatia
    'Europe/Nicosia',        // Cyprus
    'Europe/Prague',         // Czech Republic
    'Europe/Copenhagen',     // Denmark
    'Europe/Tallinn',        // Estonia
    'Europe/Helsinki',       // Finland
    'Europe/Paris',          // France
    'Europe/Berlin',         // Germany
    'Europe/Athens',         // Greece
    'Europe/Budapest',       // Hungary
    'Europe/Reykjavik',      // Iceland
    'Europe/Dublin',         // Ireland
    'Europe/Rome',           // Italy
    'Europe/Riga',           // Latvia
    'Europe/Vaduz',          // Liechtenstein
    'Europe/Vilnius',        // Lithuania
    'Europe/Luxembourg',     // Luxembourg
    'Europe/Skopje',         // North Macedonia
    'Europe/Malta',          // Malta
    'Europe/Chisinau',       // Moldova
    'Europe/Monaco',         // Monaco
    'Europe/Podgorica',      // Montenegro
    'Europe/Amsterdam',      // Netherlands
    'Europe/Oslo',           // Norway
    'Europe/Warsaw',         // Poland
    'Europe/Lisbon',         // Portugal
    'Europe/Bucharest',      // Romania
    'Europe/Moscow',         // Russia
    'Europe/San_Marino',     // San Marino
    'Europe/Belgrade',       // Serbia
    'Europe/Bratislava',     // Slovakia
    'Europe/Ljubljana',      // Slovenia
    'Europe/Madrid',         // Spain
    'Europe/Stockholm',      // Sweden
    'Europe/Zurich',         // Switzerland
    'Europe/Istanbul',       // Turkey
    'Europe/Kiev',           // Ukraine
    'Europe/London',         // United Kingdom
    'Europe/Vatican',        // Vatican City

    // ============================================
    // OCEANIA (14 countries)
    // ============================================
    'Australia/Sydney',      // Australia
    'Pacific/Fiji',          // Fiji
    'Pacific/Tarawa',        // Kiribati
    'Pacific/Majuro',        // Marshall Islands
    'Pacific/Pohnpei',       // Micronesia
    'Pacific/Nauru',         // Nauru
    'Pacific/Auckland',      // New Zealand
    'Pacific/Palau',         // Palau
    'Pacific/Port_Moresby',  // Papua New Guinea
    'Pacific/Apia',          // Samoa
    'Pacific/Guadalcanal',   // Solomon Islands
    'Pacific/Tongatapu',     // Tonga
    'Pacific/Funafuti',      // Tuvalu
    'Pacific/Efate',         // Vanuatu
];

export default timezones;