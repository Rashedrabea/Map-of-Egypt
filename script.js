// ============================================================
// script.js - التطبيق المتطور
// ============================================================

// ============================================================
// 1. انتظار تحميل الصفحة
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  // ============================================================
  // 2. التحقق من تحميل Leaflet
  // ============================================================
  if (typeof L === "undefined") {
    var script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = function () {
      location.reload();
    };
    script.onerror = function () {
      alert(
        "❌ لم نتمكن من تحميل مكتبة الخريطة. يرجى التأكد من اتصال الإنترنت.",
      );
    };
    document.head.appendChild(script);
    return;
  }

  console.log("✅ التطبيق بدأ التشغيل");

  // ============================================================
  // 3. تهيئة الخريطة
  // ============================================================
  var map = L.map("map", {
    center: [26.8206, 30.8025],
    zoom: 6,
    zoomControl: true,
  });

  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 19,
  }).addTo(map);

  console.log("✅ الخريطة تم إنشاؤها");

  // ============================================================
  // 4. المتغيرات العامة
  // ============================================================
  var currentMarker = null;
  var currentService = "hospital";
  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  var recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  var userRatings = JSON.parse(localStorage.getItem("userRatings")) || {};
  var selectedPlace = null;

  // ============================================================
  // 5. بيانات الخدمات (موسعة)
  // ============================================================
  var serviceData = {
    hospital: [
      {
        id: "h1",
        name: "مستشفى القاهرة الجامعي",
        lat: 30.0444,
        lon: 31.2357,
        address: "القصر العيني، القاهرة",
        phone: "0235678900",
        rating: 4.5,
        reviews: 120,
        hours: "24 ساعة",
        type: "حكومي",
      },
      {
        id: "h2",
        name: "مستشفى المعادي",
        lat: 29.9686,
        lon: 31.2461,
        address: "شارع 9، المعادي",
        phone: "0235678901",
        rating: 4.2,
        reviews: 85,
        hours: "8ص - 10م",
        type: "خاص",
      },
      {
        id: "h3",
        name: "مستشفى 6 أكتوبر",
        lat: 29.9554,
        lon: 31.2936,
        address: "مدينة 6 أكتوبر",
        phone: "0235678902",
        rating: 4.0,
        reviews: 65,
        hours: "24 ساعة",
        type: "حكومي",
      },
      {
        id: "h4",
        name: "مستشفى الجيزة العام",
        lat: 30.0166,
        lon: 31.2131,
        address: "شارع الهرم، الجيزة",
        phone: "0235678903",
        rating: 3.8,
        reviews: 45,
        hours: "24 ساعة",
        type: "حكومي",
      },
    ],
    pharmacy: [
      {
        id: "p1",
        name: "صيدلية العزبي",
        lat: 30.0484,
        lon: 31.2387,
        address: "شارع التحرير، القاهرة",
        phone: "0235678904",
        rating: 4.3,
        reviews: 56,
        hours: "9ص - 11م",
        type: "سلسلة",
      },
      {
        id: "p2",
        name: "صيدلية النيل",
        lat: 29.9726,
        lon: 31.2491,
        address: "شارع النيل، المعادي",
        phone: "0235678905",
        rating: 4.1,
        reviews: 34,
        hours: "8ص - 10م",
        type: "خاصة",
      },
      {
        id: "p3",
        name: "صيدلية الصحة",
        lat: 29.9584,
        lon: 31.2966,
        address: "شارع الصحة، 6 أكتوبر",
        phone: "0235678906",
        rating: 4.4,
        reviews: 42,
        hours: "24 ساعة",
        type: "سلسلة",
      },
    ],
    bank: [
      {
        id: "b1",
        name: "البنك الأهلي المصري",
        lat: 30.0464,
        lon: 31.2367,
        address: "شارع قصر النيل، القاهرة",
        phone: "0235678907",
        rating: 4.0,
        reviews: 78,
        hours: "8:30ص - 3م",
        type: "حكومي",
      },
      {
        id: "b2",
        name: "بنك مصر",
        lat: 30.0524,
        lon: 31.2397,
        address: "شارع البستان، القاهرة",
        phone: "0235678908",
        rating: 4.2,
        reviews: 92,
        hours: "8:30ص - 3م",
        type: "حكومي",
      },
      {
        id: "b3",
        name: "بنك القاهرة",
        lat: 30.04,
        lon: 31.23,
        address: "شارع قصر النيل، القاهرة",
        phone: "0235678909",
        rating: 3.9,
        reviews: 45,
        hours: "8:30ص - 3م",
        type: "خاص",
      },
    ],
    restaurant: [
      {
        id: "r1",
        name: "مطعم النيل",
        lat: 30.0474,
        lon: 31.2347,
        address: "شارع النيل، القاهرة",
        phone: "0235678910",
        rating: 4.6,
        reviews: 156,
        hours: "12م - 12ص",
        type: "مصري",
      },
      {
        id: "r2",
        name: "مطعم الأهرام",
        lat: 29.9666,
        lon: 31.2471,
        address: "شارع الأهرام، المعادي",
        phone: "0235678911",
        rating: 4.3,
        reviews: 89,
        hours: "1م - 11ص",
        type: "شرقي",
      },
      {
        id: "r3",
        name: "مطعم الفردوس",
        lat: 29.9604,
        lon: 31.2956,
        address: "شارع الفردوس، 6 أكتوبر",
        phone: "0235678912",
        rating: 4.4,
        reviews: 67,
        hours: "12م - 12ص",
        type: "مصري",
      },
    ],
    fuel: [
      {
        id: "f1",
        name: "محطة مصر للبترول",
        lat: 30.0494,
        lon: 31.2377,
        address: "شارع رمسيس، القاهرة",
        phone: "0235678913",
        rating: 4.1,
        reviews: 34,
        hours: "24 ساعة",
        type: "حكومي",
      },
      {
        id: "f2",
        name: "محطة شل",
        lat: 29.9706,
        lon: 31.2481,
        address: "شارع النيل، المعادي",
        phone: "0235678914",
        rating: 4.3,
        reviews: 28,
        hours: "6ص - 12ص",
        type: "خاص",
      },
      {
        id: "f3",
        name: "محطة توتال",
        lat: 29.9624,
        lon: 31.2946,
        address: "شارع التحرير، 6 أكتوبر",
        phone: "0235678915",
        rating: 4.2,
        reviews: 22,
        hours: "24 ساعة",
        type: "خاص",
      },
    ],
    tourist: [
      {
        id: "t1",
        name: "أهرامات الجيزة",
        lat: 29.9792,
        lon: 31.1342,
        address: "الجيزة",
        phone: "0235678916",
        rating: 4.9,
        reviews: 1560,
        hours: "8ص - 5م",
        type: "أثري",
      },
      {
        id: "t2",
        name: "المتحف المصري",
        lat: 30.0479,
        lon: 31.2334,
        address: "ميدان التحرير، القاهرة",
        phone: "0235678917",
        rating: 4.8,
        reviews: 1200,
        hours: "9ص - 5م",
        type: "متحف",
      },
      {
        id: "t3",
        name: "قلعة صلاح الدين",
        lat: 30.049,
        lon: 31.262,
        address: "القاهرة",
        phone: "0235678918",
        rating: 4.7,
        reviews: 890,
        hours: "9ص - 5م",
        type: "أثري",
      },
    ],
    metro: [
      {
        id: "m1",
        name: "محطة السادات",
        lat: 30.0444,
        lon: 31.2357,
        address: "ميدان التحرير، القاهرة",
        extra: "🚇 الخط 1 و 2",
        rating: 4.3,
        reviews: 230,
        type: "محطة",
      },
      {
        id: "m2",
        name: "محطة المرج الجديدة",
        lat: 30.12,
        lon: 31.3,
        address: "المرج، القاهرة",
        extra: "🚇 الخط 1",
        rating: 4.0,
        reviews: 120,
        type: "محطة",
      },
      {
        id: "m3",
        name: "محطة شبرا الخيمة",
        lat: 30.13,
        lon: 31.25,
        address: "شبرا الخيمة، القاهرة",
        extra: "🚇 الخط 1",
        rating: 3.8,
        reviews: 89,
        type: "محطة",
      },
    ],
    parking: [
      {
        id: "pa1",
        name: "موقف التحرير",
        lat: 30.045,
        lon: 31.236,
        address: "ميدان التحرير، القاهرة",
        extra: "🅿️ 500 سيارة",
        price: "15 ج/ساعة",
        rating: 4.0,
        reviews: 67,
        type: "مغطى",
      },
      {
        id: "pa2",
        name: "موقف الزمالك",
        lat: 30.07,
        lon: 31.22,
        address: "الزمالك، القاهرة",
        extra: "🅿️ 200 سيارة",
        price: "10 ج/ساعة",
        rating: 4.2,
        reviews: 45,
        type: "مفتوح",
      },
      {
        id: "pa3",
        name: "موقف مدينة نصر",
        lat: 30.06,
        lon: 31.29,
        address: "مدينة نصر، القاهرة",
        extra: "🅿️ 800 سيارة",
        price: "12 ج/ساعة",
        rating: 4.1,
        reviews: 78,
        type: "مغطى",
      },
    ],
    police: [
      {
        id: "po1",
        name: "قسم شرطة التحرير",
        lat: 30.044,
        lon: 31.235,
        address: "ميدان التحرير، القاهرة",
        phone: "122",
        rating: 4.0,
        reviews: 34,
        type: "قسم",
      },
      {
        id: "po2",
        name: "قسم شرطة الزمالك",
        lat: 30.07,
        lon: 31.22,
        address: "الزمالك، القاهرة",
        phone: "122",
        rating: 3.9,
        reviews: 28,
        type: "قسم",
      },
      {
        id: "po3",
        name: "قسم شرطة مدينة نصر",
        lat: 30.06,
        lon: 31.29,
        address: "مدينة نصر، القاهرة",
        phone: "122",
        rating: 4.1,
        reviews: 42,
        type: "قسم",
      },
    ],
    school: [
      {
        id: "s1",
        name: "مدرسة القاهرة الثانوية",
        lat: 30.0454,
        lon: 31.2367,
        address: "شارع رمسيس، القاهرة",
        rating: 4.2,
        reviews: 45,
        type: "ثانوي",
      },
      {
        id: "s2",
        name: "مدرسة المعادي التجريبية",
        lat: 29.9696,
        lon: 31.2471,
        address: "شارع 9، المعادي",
        rating: 4.4,
        reviews: 56,
        type: "تجريبي",
      },
      {
        id: "s3",
        name: "مدرسة السلام الابتدائية",
        lat: 30.13,
        lon: 31.3,
        address: "السلام، القاهرة",
        rating: 3.8,
        reviews: 23,
        type: "ابتدائي",
      },
    ],
    mosque: [
      {
        id: "mo1",
        name: "جامع الأزهر الشريف",
        lat: 30.0458,
        lon: 31.2627,
        address: "الأزهر، القاهرة",
        rating: 4.9,
        reviews: 340,
        type: "جامع",
      },
      {
        id: "mo2",
        name: "مسجد الحسين",
        lat: 30.0464,
        lon: 31.2614,
        address: "الحسين، القاهرة",
        rating: 4.8,
        reviews: 290,
        type: "مسجد",
      },
      {
        id: "mo3",
        name: "مسجد محمد علي",
        lat: 30.0486,
        lon: 31.263,
        address: "القلعة، القاهرة",
        rating: 4.7,
        reviews: 210,
        type: "مسجد",
      },
    ],
    park: [
      {
        id: "pa1",
        name: "حديقة الأزهر",
        lat: 30.045,
        lon: 31.262,
        address: "الأزهر، القاهرة",
        rating: 4.6,
        reviews: 180,
        type: "عامة",
      },
      {
        id: "pa2",
        name: "حديقة الحيوان",
        lat: 30.02,
        lon: 31.21,
        address: "الجيزة",
        rating: 4.3,
        reviews: 140,
        type: "عامة",
      },
      {
        id: "pa3",
        name: "حديقة الميريلاند",
        lat: 30.08,
        lon: 31.29,
        address: "مدينة نصر، القاهرة",
        rating: 4.4,
        reviews: 95,
        type: "عامة",
      },
    ],
    airport: [
      {
        id: "a1",
        name: "مطار القاهرة الدولي",
        lat: 30.1225,
        lon: 31.4056,
        address: "مصر الجديدة، القاهرة",
        code: "CAI",
        rating: 4.3,
        reviews: 560,
        type: "دولي",
      },
      {
        id: "a2",
        name: "مطار برج العرب",
        lat: 30.927,
        lon: 29.6964,
        address: "برج العرب، الإسكندرية",
        code: "HBE",
        rating: 4.1,
        reviews: 230,
        type: "دولي",
      },
    ],
    train: [
      {
        id: "tr1",
        name: "محطة مصر - رمسيس",
        lat: 30.049,
        lon: 31.238,
        address: "ميدان رمسيس، القاهرة",
        extra: "القاهرة - الإسكندرية - الأقصر",
        rating: 4.2,
        reviews: 340,
        type: "رئيسية",
      },
      {
        id: "tr2",
        name: "محطة الجيزة",
        lat: 30.01,
        lon: 31.21,
        address: "الجيزة",
        extra: "القاهرة - أسوان",
        rating: 4.0,
        reviews: 180,
        type: "فرعية",
      },
    ],
    hotel: [
      {
        id: "ho1",
        name: "فندق ماريوت الزمالك",
        lat: 30.07,
        lon: 31.22,
        address: "الزمالك، القاهرة",
        phone: "0235678919",
        rating: 4.7,
        reviews: 450,
        stars: 5,
        type: "فاخر",
      },
      {
        id: "ho2",
        name: "فندق سوفيتيل القاهرة",
        lat: 30.04,
        lon: 31.23,
        address: "الزمالك، القاهرة",
        phone: "0235678920",
        rating: 4.6,
        reviews: 380,
        stars: 5,
        type: "فاخر",
      },
      {
        id: "ho3",
        name: "فندق شبرد",
        lat: 30.05,
        lon: 31.24,
        address: "وسط البلد، القاهرة",
        phone: "0235678921",
        rating: 4.4,
        reviews: 210,
        stars: 4,
        type: "تاريخي",
      },
    ],
    atm: [
      {
        id: "atm1",
        name: "ATM البنك الأهلي",
        lat: 30.046,
        lon: 31.237,
        address: "ميدان التحرير، القاهرة",
        bank: "البنك الأهلي",
        rating: 4.0,
        reviews: 34,
        type: "ATM",
      },
      {
        id: "atm2",
        name: "ATM بنك مصر",
        lat: 30.052,
        lon: 31.24,
        address: "وسط البلد، القاهرة",
        bank: "بنك مصر",
        rating: 4.1,
        reviews: 28,
        type: "ATM",
      },
      {
        id: "atm3",
        name: "ATM بنك القاهرة",
        lat: 30.04,
        lon: 31.23,
        address: "قصر النيل، القاهرة",
        bank: "بنك القاهرة",
        rating: 3.9,
        reviews: 22,
        type: "ATM",
      },
    ],
  };

  // ============================================================
  // 6. دوال مساعدة
  // ============================================================
  function showToast(message) {
    var existing = document.querySelector(".toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.remove();
    }, 3000);
  }

  function closeAllPanels() {
    document
      .querySelectorAll(
        "#resultsPanel, #favoritesPanel, #weatherPanel, #trafficPanel, #sideMenu, #placeDetail",
      )
      .forEach(function (p) {
        p.classList.remove("open");
      });
    document.getElementById("overlay").classList.remove("show");
  }

  function renderStars(rating) {
    var full = Math.floor(rating);
    var half = rating % 1 >= 0.5;
    var html = "";
    for (var i = 0; i < full; i++) html += "⭐";
    if (half) html += "⭐";
    return html;
  }

  function getRating(placeId) {
    return userRatings[placeId] || null;
  }

  function formatPhone(phone) {
    if (!phone) return "غير متوفر";
    return phone;
  }

  // ============================================================
  // 7. شاشة الترحيب
  // ============================================================
  setTimeout(function () {
    var splash = document.getElementById("splashScreen");
    splash.classList.add("hide");
    setTimeout(function () {
      splash.style.display = "none";
    }, 600);
  }, 2500);

  // ============================================================
  // 8. البحث
  // ============================================================
  async function searchAddress(query) {
    if (!query.trim()) {
      showToast("⚠️ الرجاء إدخال نص للبحث");
      return;
    }

    // حفظ البحث
    if (!recentSearches.includes(query)) {
      recentSearches.unshift(query);
      if (recentSearches.length > 10) recentSearches.pop();
      localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }

    try {
      showToast("⏳ جاري البحث...");

      var response = await fetch(
        "https://nominatim.openstreetmap.org/search?q=" +
          encodeURIComponent(query) +
          "&format=json&limit=10&addressdetails=1&accept-language=ar",
        {
          headers: { "User-Agent": "MyMapApp/1.0" },
        },
      );

      var data = await response.json();

      if (data.length === 0) {
        showToast("❌ لم يتم العثور على نتائج");
        return;
      }

      displayResults(data);

      var first = data[0];
      map.setView([first.lat, first.lon], 14);
      addMarker(first.lat, first.lon, first.display_name);

      showToast("✅ تم العثور على " + data.length + " نتيجة");
    } catch (error) {
      console.error(error);
      showToast("❌ حدث خطأ أثناء البحث");
    }
  }

  // ============================================================
  // 9. إضافة ماركر
  // ============================================================
  function addMarker(lat, lon, popupText, placeData) {
    if (currentMarker) {
      map.removeLayer(currentMarker);
    }

    currentMarker = L.marker([lat, lon], { riseOnHover: true }).addTo(map);

    var content = popupText || "📍 المكان";
    if (placeData) {
      content = `
                <div style="text-align:center;padding:5px;min-width:150px;">
                    <div style="font-weight:600;font-size:14px;">${placeData.name}</div>
                    <div style="font-size:12px;color:#666;margin:4px 0;">${placeData.address || ""}</div>
                    ${placeData.rating ? `<div style="font-size:12px;color:#f39c12;">${renderStars(placeData.rating)}</div>` : ""}
                    <button onclick="openPlaceDetail('${placeData.id}')" style="
                        margin-top:6px;
                        background:#1a73e8;
                        color:white;
                        border:none;
                        padding:4px 12px;
                        border-radius:20px;
                        cursor:pointer;
                        font-size:12px;
                    ">
                        <i class="fas fa-info-circle"></i> تفاصيل
                    </button>
                </div>
            `;
    }

    currentMarker.bindPopup(content).openPopup();
    return currentMarker;
  }

  // ============================================================
  // 10. عرض النتائج
  // ============================================================
  function displayResults(results) {
    var resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = "";

    results.forEach(function (item) {
      var div = document.createElement("div");
      div.className = "result-item";

      var nameParts = item.display_name.split(",");
      var name = nameParts[0];
      var address = nameParts.slice(1).join(", ");

      div.innerHTML = `
                <div class="info">
                    <div class="name">${name}</div>
                    <div class="address">${address}</div>
                </div>
                <div class="actions">
                    <button class="fav-btn" onclick="event.stopPropagation(); addToFavorites('${encodeURIComponent(item.display_name)}', ${item.lat}, ${item.lon})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            `;

      div.addEventListener("click", function () {
        map.setView([item.lat, item.lon], 16);
        addMarker(item.lat, item.lon, item.display_name);
        document.getElementById("resultsPanel").classList.remove("open");
      });

      resultsList.appendChild(div);
    });

    document.getElementById("resultsPanel").classList.add("open");
  }

  // ============================================================
  // 11. عرض نتائج الخدمات
  // ============================================================
  function displayServiceResults(points, serviceKey) {
    var resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = "";

    if (points.length === 0) {
      resultsList.innerHTML =
        '<div style="padding:20px;text-align:center;color:#999;">لا توجد بيانات لهذه الخدمة</div>';
      return;
    }

    points.forEach(function (point) {
      var div = document.createElement("div");
      div.className = "result-item";

      var extraHtml = "";
      if (point.extra)
        extraHtml += '<div class="extra">' + point.extra + "</div>";
      if (point.price)
        extraHtml += '<div class="extra">💰 ' + point.price + "</div>";
      if (point.stars)
        extraHtml += '<div class="extra">⭐ ' + point.stars + " نجوم</div>";
      if (point.code)
        extraHtml += '<div class="extra">🛫 ' + point.code + "</div>";
      if (point.bank)
        extraHtml += '<div class="extra">🏦 ' + point.bank + "</div>";

      var ratingHtml = "";
      if (point.rating) {
        ratingHtml =
          '<div class="rating">' +
          renderStars(point.rating) +
          " " +
          point.rating +
          "</div>";
      }

      div.innerHTML = `
                <div class="info">
                    <div class="name">${point.name}</div>
                    <div class="address">${point.address || point.lat.toFixed(4) + ", " + point.lon.toFixed(4)}</div>
                    ${ratingHtml}
                    ${extraHtml}
                </div>
                <div class="actions">
                    <button onclick="event.stopPropagation(); openPlaceDetail('${point.id}')" title="تفاصيل">
                        <i class="fas fa-info-circle" style="color:#1a73e8;"></i>
                    </button>
                    <button class="fav-btn" onclick="event.stopPropagation(); addToFavorites('${encodeURIComponent(point.name)}', ${point.lat}, ${point.lon})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            `;

      div.addEventListener("click", function () {
        map.setView([point.lat, point.lon], 16);
        addMarker(point.lat, point.lon, point.name, point);
        document.getElementById("resultsPanel").classList.remove("open");
      });

      resultsList.appendChild(div);
    });

    document.getElementById("resultsPanel").classList.add("open");
  }

  // ============================================================
  // 12. تفاصيل المكان
  // ============================================================
  window.openPlaceDetail = function (placeId) {
    // البحث عن المكان في جميع الخدمات
    var place = null;
    var serviceKey = null;

    for (var key in serviceData) {
      var found = serviceData[key].find(function (p) {
        return p.id === placeId;
      });
      if (found) {
        place = found;
        serviceKey = key;
        break;
      }
    }

    if (!place) {
      showToast("❌ لم يتم العثور على المكان");
      return;
    }

    selectedPlace = place;
    document.getElementById("placeDetailTitle").textContent = place.name;

    var content = document.getElementById("placeDetailContent");
    var details = [
      { label: "📍 العنوان", value: place.address || "غير متوفر" },
      { label: "📞 الهاتف", value: formatPhone(place.phone) },
      {
        label: "⭐ التقييم",
        value: place.rating
          ? renderStars(place.rating) + " (" + place.rating + ")"
          : "غير متوفر",
      },
      { label: "📝 عدد التقييمات", value: place.reviews || "غير متوفر" },
      { label: "🕐 ساعات العمل", value: place.hours || "غير متوفر" },
      { label: "🏷️ النوع", value: place.type || "غير متوفر" },
    ];

    if (place.stars)
      details.push({ label: "⭐ عدد النجوم", value: place.stars + " نجوم" });
    if (place.code) details.push({ label: "🛫 كود المطار", value: place.code });
    if (place.bank) details.push({ label: "🏦 البنك", value: place.bank });
    if (place.price) details.push({ label: "💰 السعر", value: place.price });
    if (place.extra)
      details.push({ label: "ℹ️ معلومات إضافية", value: place.extra });

    var html = "";
    details.forEach(function (d) {
      html += `
                <div class="detail-row">
                    <div class="label">${d.label}</div>
                    <div class="value">${d.value}</div>
                </div>
            `;
    });

    html += `
            <div class="detail-actions">
                <button class="btn-route" onclick="navigateToPlace()">
                    <i class="fas fa-route"></i> توجيه
                </button>
                <button class="btn-favorite" onclick="addToFavorites('${encodeURIComponent(place.name)}', ${place.lat}, ${place.lon})">
                    <i class="fas fa-heart"></i> حفظ
                </button>
                <button class="btn-share" onclick="sharePlace()">
                    <i class="fas fa-share-alt"></i> مشاركة
                </button>
            </div>
        `;

    content.innerHTML = html;
    document.getElementById("placeDetail").classList.add("open");
    document.getElementById("overlay").classList.add("show");
  };

  window.navigateToPlace = function () {
    if (!selectedPlace) return;
    var start = document.getElementById("searchInput");
    start.value = "موقعي الحالي";
    document.getElementById("routeStart").value = selectedPlace.name;
    document.getElementById("routeStart").dataset.lat = selectedPlace.lat;
    document.getElementById("routeStart").dataset.lon = selectedPlace.lon;
    showToast("📍 تم تعيين نقطة الوصول");
    document.getElementById("placeDetail").classList.remove("open");
    document.getElementById("overlay").classList.remove("show");
  };

  window.sharePlace = function () {
    if (!selectedPlace) return;
    var url =
      "https://maps.google.com/?q=" +
      selectedPlace.lat +
      "," +
      selectedPlace.lon;
    if (navigator.share) {
      navigator
        .share({
          title: selectedPlace.name,
          text:
            "📍 " + selectedPlace.name + "\n" + (selectedPlace.address || ""),
          url: url,
        })
        .catch(function () {});
    } else {
      navigator.clipboard
        .writeText(url)
        .then(function () {
          showToast("✅ تم نسخ الرابط");
        })
        .catch(function () {
          prompt("انسخ الرابط:", url);
        });
    }
  };

  document.getElementById("closeDetail").addEventListener("click", function () {
    document.getElementById("placeDetail").classList.remove("open");
    document.getElementById("overlay").classList.remove("show");
  });

  document.getElementById("overlay").addEventListener("click", function () {
    document.getElementById("placeDetail").classList.remove("open");
    this.classList.remove("show");
  });

  // ============================================================
  // 13. المفضلة
  // ============================================================
  window.addToFavorites = function (name, lat, lon) {
    var displayName = decodeURIComponent(name);
    var existing = favorites.find(function (f) {
      return f.lat === lat && f.lon === lon;
    });

    if (existing) {
      showToast("📍 هذا المكان موجود بالفعل في المفضلة");
      return;
    }

    favorites.push({ displayName: displayName, lat: lat, lon: lon });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    showToast("❤️ تمت الإضافة إلى المفضلة");
    renderFavorites();
  };

  window.removeFromFavorites = function (index) {
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    showToast("🗑️ تم الحذف من المفضلة");
    renderFavorites();
  };

  function renderFavorites() {
    var list = document.getElementById("favoritesList");
    list.innerHTML = "";

    if (favorites.length === 0) {
      list.innerHTML =
        '<div style="padding:20px;text-align:center;color:#999;">لا توجد أماكن مفضلة</div>';
      return;
    }

    favorites.forEach(function (item, index) {
      var div = document.createElement("div");
      div.className = "result-item";
      div.innerHTML = `
                <div class="info">
                    <div class="name">${item.displayName}</div>
                    <div class="address">${item.lat.toFixed(4)}, ${item.lon.toFixed(4)}</div>
                </div>
                <div class="actions">
                    <button onclick="event.stopPropagation(); removeFromFavorites(${index})" title="حذف">
                        <i class="fas fa-trash" style="color:#e74c3c;"></i>
                    </button>
                </div>
            `;
      div.addEventListener("click", function () {
        map.setView([item.lat, item.lon], 16);
        addMarker(item.lat, item.lon, item.displayName);
        document.getElementById("favoritesPanel").classList.remove("open");
      });
      list.appendChild(div);
    });
  }

  document
    .getElementById("favoritesBtn")
    .addEventListener("click", function () {
      closeAllPanels();
      document.getElementById("favoritesPanel").classList.toggle("open");
      renderFavorites();
    });

  document
    .getElementById("closeFavorites")
    .addEventListener("click", function () {
      document.getElementById("favoritesPanel").classList.remove("open");
    });

  // ============================================================
  // 14. تحديد الموقع
  // ============================================================
  function locateUser() {
    if (!navigator.geolocation) {
      showToast("⚠️ متصفحك لا يدعم تحديد الموقع");
      return;
    }

    showToast("⏳ جاري تحديد موقعك...");

    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        map.setView([lat, lon], 16);
        addMarker(lat, lon, "📍 موقعك الحالي");
        showToast("✅ تم تحديد موقعك بنجاح");

        // تحديث الإحصائيات
        updateQuickStats(lat, lon);

        // عرض الطقس تلقائياً
        fetchWeather(lat, lon);
      },
      function (error) {
        showToast("⚠️ لم نتمكن من تحديد موقعك");
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  document.getElementById("locateBtn").addEventListener("click", locateUser);

  // ============================================================
  // 15. إحصائيات سريعة
  // ============================================================
  function updateQuickStats(lat, lon) {
    var stats = document.getElementById("quickStats");
    var services = [
      "hospital",
      "pharmacy",
      "bank",
      "restaurant",
      "fuel",
      "metro",
      "parking",
      "school",
    ];

    var html = "";
    services.forEach(function (key) {
      var points = serviceData[key] || [];
      var count = points.filter(function (p) {
        if (!lat || !lon) return true;
        var d = getDistance(lat, lon, p.lat, p.lon);
        return d <= 10; // في حدود 10 كم
      }).length;

      var icons = {
        hospital: "🏥",
        pharmacy: "💊",
        bank: "🏦",
        restaurant: "🍽️",
        fuel: "⛽",
        metro: "🚇",
        parking: "🅿️",
        school: "📚",
      };

      html += `
                <div class="stat-item">
                    <div class="number">${count}</div>
                    <div class="label">${icons[key] || "📌"} ${key === "hospital" ? "مستشفيات" : key === "pharmacy" ? "صيدليات" : key === "bank" ? "بنوك" : key === "restaurant" ? "مطاعم" : key === "fuel" ? "بنزين" : key === "metro" ? "مترو" : key === "parking" ? "مواقف" : "مدارس"}</div>
                </div>
            `;
    });

    stats.innerHTML = html;
  }

  function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = ((lat2 - lat1) * Math.PI) / 180;
    var dLon = ((lon2 - lon1) * Math.PI) / 180;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // ============================================================
  // 16. الطقس
  // ============================================================
  document.getElementById("weatherBtn").addEventListener("click", function () {
    closeAllPanels();
    var panel = document.getElementById("weatherPanel");
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      var center = map.getCenter();
      fetchWeather(center.lat, center.lng);
    }
  });

  document
    .getElementById("closeWeather")
    .addEventListener("click", function () {
      document.getElementById("weatherPanel").classList.remove("open");
    });

  async function fetchWeather(lat, lon) {
    var info = document.getElementById("weatherInfo");
    info.innerHTML =
      '<div style="padding:20px;text-align:center;">⏳ جاري جلب بيانات الطقس...</div>';

    try {
      var response = await fetch(
        "https://wttr.in/" + lat + "," + lon + "?format=j1&lang=ar",
        {
          headers: { "User-Agent": "MyMapApp/1.0" },
        },
      );
      var data = await response.json();

      if (!data || !data.current_condition) {
        throw new Error("لا توجد بيانات");
      }

      var current = data.current_condition[0];
      var weather = {
        temp: current.temp_C,
        condition: current.weatherDesc[0]?.value || "غير معروف",
        humidity: current.humidity,
        windSpeed: current.windspeedKmph,
        feelsLike: current.FeelsLikeC || current.temp_C,
        pressure: current.pressure || "1013",
        uvIndex: current.uvIndex || "N/A",
      };

      var iconMap = {
        مشمس: "☀️",
        غائم: "☁️",
        ممطر: "🌧️",
        عاصف: "💨",
        ثلجي: "❄️",
        ضبابي: "🌫️",
      };
      var icon = "🌤️";
      for (var key in iconMap) {
        if (weather.condition.includes(key)) icon = iconMap[key];
      }

      // توقعات 5 أيام
      var forecastHtml = "";
      if (data.weather && data.weather.length > 0) {
        forecastHtml = '<div class="weather-forecast">';
        var days = ["اليوم", "غداً", "بعد غد", "+٣", "+٤"];
        for (var i = 0; i < Math.min(5, data.weather.length); i++) {
          var day = data.weather[i];
          var temp = day.avgtempC || "--";
          var condition =
            day.hourly?.[0]?.weatherDesc?.[0]?.value || "غير معروف";
          var iconDay = "🌤️";
          for (var key2 in iconMap) {
            if (condition.includes(key2)) iconDay = iconMap[key2];
          }
          forecastHtml += `
                        <div class="day">
                            <div class="day-name">${days[i]}</div>
                            <div class="day-icon">${iconDay}</div>
                            <div class="day-temp">${temp}°C</div>
                        </div>
                    `;
        }
        forecastHtml += "</div>";
      }

      info.innerHTML = `
                <div class="weather-card">
                    <div style="display:flex;justify-content:space-between;align-items:start;">
                        <div>
                            <div style="font-size:12px;opacity:0.8;">📍 موقعك الحالي</div>
                            <div class="temp">${weather.temp}°C</div>
                            <div class="condition">${icon} ${weather.condition}</div>
                        </div>
                        <div style="font-size:40px;">${icon}</div>
                    </div>
                    <div class="details">
                        <div>💧 الرطوبة: ${weather.humidity}%</div>
                        <div>💨 الرياح: ${weather.windSpeed} كم/س</div>
                        <div>🌡️ يشعر بـ: ${weather.feelsLike}°C</div>
                        <div>📊 الضغط: ${weather.pressure} hPa</div>
                        <div>☀️ الأشعة UV: ${weather.uvIndex}</div>
                        <div>📏 الإحداثيات: ${lat.toFixed(2)}, ${lon.toFixed(2)}</div>
                    </div>
                </div>
                ${forecastHtml}
                <div style="padding:0 15px 15px;font-size:11px;color:#999;">
                    <i class="fas fa-info-circle"></i> بيانات الطقس من wttr.in
                </div>
            `;
    } catch (error) {
      console.error(error);
      info.innerHTML = `
                <div style="padding:20px;text-align:center;color:#e74c3c;">
                    ❌ حدث خطأ في جلب بيانات الطقس
                </div>
            `;
    }
  }

  // ============================================================
  // 17. حركة المرور
  // ============================================================
  document.getElementById("trafficBtn").addEventListener("click", function () {
    closeAllPanels();
    var panel = document.getElementById("trafficPanel");
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      showTraffic();
    }
  });

  document
    .getElementById("closeTraffic")
    .addEventListener("click", function () {
      document.getElementById("trafficPanel").classList.remove("open");
    });

  function showTraffic() {
    var info = document.getElementById("trafficInfo");

    var trafficData = [
      {
        road: "طريق القاهرة - الإسكندرية",
        status: "good",
        delay: "0 دقائق",
        speed: "110 كم/س",
        time: new Date().toLocaleTimeString("ar-EG"),
      },
      {
        road: "طريق القاهرة - السويس",
        status: "moderate",
        delay: "15 دقائق",
        speed: "80 كم/س",
        time: new Date().toLocaleTimeString("ar-EG"),
      },
      {
        road: "طريق الإسكندرية - مطروح",
        status: "heavy",
        delay: "30 دقائق",
        speed: "40 كم/س",
        time: new Date().toLocaleTimeString("ar-EG"),
      },
      {
        road: "طريق القاهرة - الفيوم",
        status: "good",
        delay: "0 دقائق",
        speed: "100 كم/س",
        time: new Date().toLocaleTimeString("ar-EG"),
      },
      {
        road: "طريق القاهرة - بني سويف",
        status: "moderate",
        delay: "10 دقائق",
        speed: "85 كم/س",
        time: new Date().toLocaleTimeString("ar-EG"),
      },
      {
        road: "طريق الإسماعيلية - بورسعيد",
        status: "heavy",
        delay: "45 دقائق",
        speed: "35 كم/س",
        time: new Date().toLocaleTimeString("ar-EG"),
      },
      {
        road: "طريق القاهرة - العين السخنة",
        status: "moderate",
        delay: "20 دقائق",
        speed: "70 كم/س",
        time: new Date().toLocaleTimeString("ar-EG"),
      },
    ];

    var statusMap = {
      good: { text: "✅ جيدة", class: "good" },
      moderate: { text: "⚠️ متوسطة", class: "moderate" },
      heavy: { text: "❌ مزدحمة", class: "heavy" },
    };

    var html = `
            <div style="padding:12px 15px;background:#f8f9fa;margin:0 15px 10px;border-radius:10px;font-size:13px;display:flex;justify-content:space-between;align-items:center;">
                <span><i class="fas fa-clock" style="color:#1a73e8;"></i> آخر تحديث: ${new Date().toLocaleTimeString("ar-EG")}</span>
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#2ecc71;"></span>
            </div>
        `;

    trafficData.forEach(function (item) {
      var status = statusMap[item.status];
      html += `
                <div class="traffic-item" style="border-right-color: ${item.status === "good" ? "#2ecc71" : item.status === "moderate" ? "#f39c12" : "#e74c3c"};">
                    <div class="road">🛣️ ${item.road}</div>
                    <div class="status ${status.class}">${status.text}</div>
                    <div class="detail">⏱️ تأخير: ${item.delay} • 🚗 السرعة: ${item.speed}</div>
                </div>
            `;
    });

    html += `
            <div style="padding:0 15px 15px;font-size:11px;color:#999;">
                <i class="fas fa-info-circle"></i> بيانات المرور تجريبية وتحديث كل 5 دقائق
            </div>
        `;

    info.innerHTML = html;
  }

  // ============================================================
  // 18. طبقات الخريطة
  // ============================================================
  document.getElementById("layersBtn").addEventListener("click", function () {
    var layers = {
      العادي: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      الداكن: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      الفضائي:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      الطبوغرافي: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    };

    var choice = prompt(
      "اختر الطبقة:\n" +
        "1- العادي 🏙️\n" +
        "2- الداكن 🌙\n" +
        "3- الفضائي 🛰️\n" +
        "4- الطبوغرافي ⛰️",
      "1",
    );

    var keys = Object.keys(layers);
    var selected = keys[parseInt(choice) - 1];

    if (selected) {
      map.eachLayer(function (layer) {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });
      L.tileLayer(layers[selected], {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      showToast("✅ تم التبديل إلى طبقة " + selected);
    }
  });

  // ============================================================
  // 19. الخدمات
  // ============================================================
  function loadService(serviceKey) {
    var points = serviceData[serviceKey] || [];
    if (points.length === 0) {
      showToast("❌ لا توجد بيانات لهذه الخدمة");
      return;
    }

    // إزالة الماركرات السابقة
    if (currentMarker) {
      map.removeLayer(currentMarker);
      currentMarker = null;
    }

    displayServiceResults(points, serviceKey);

    var serviceNames = {
      hospital: "مستشفيات",
      pharmacy: "صيدليات",
      bank: "بنوك",
      restaurant: "مطاعم",
      fuel: "بنزين",
      tourist: "سياحة",
      metro: "مترو",
      parking: "مواقف",
      police: "شرطة",
      school: "مدارس",
      mosque: "مساجد",
      park: "حدائق",
      airport: "مطارات",
      train: "قطار",
      hotel: "فنادق",
      atm: "صرافات",
    };

    showToast(
      "✅ تم تحميل " +
        points.length +
        " " +
        (serviceNames[serviceKey] || serviceKey),
    );
  }

  // أزرار الخدمات
  var serviceButtons = document.querySelectorAll(".service-btn");
  serviceButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      serviceButtons.forEach(function (b) {
        b.classList.remove("active-service");
      });
      this.classList.add("active-service");

      var service = this.getAttribute("data-service");
      currentService = service;
      closeAllPanels();
      loadService(service);
    });
  });

  // ============================================================
  // 20. القائمة الجانبية
  // ============================================================
  document.getElementById("menuBtn").addEventListener("click", function () {
    var menu = document.getElementById("sideMenu");
    menu.classList.toggle("open");
    if (menu.classList.contains("open")) {
      document.getElementById("overlay").classList.add("show");
      updateQuickStats(map.getCenter().lat, map.getCenter().lng);
      renderRecentSearches();
    } else {
      document.getElementById("overlay").classList.remove("show");
    }
  });

  document.getElementById("closeMenu").addEventListener("click", function () {
    document.getElementById("sideMenu").classList.remove("open");
    document.getElementById("overlay").classList.remove("show");
  });

  function renderRecentSearches() {
    var container = document.getElementById("recentSearches");
    if (recentSearches.length === 0) {
      container.innerHTML =
        '<div style="color:#999;font-size:13px;">لا توجد عمليات بحث حديثة</div>';
      return;
    }

    var html = "";
    recentSearches.forEach(function (item) {
      html += `
                <div style="padding:8px 12px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;" 
                     onclick="searchAddress('${item}')">
                    🔍 ${item}
                </div>
            `;
    });
    container.innerHTML = html;
  }

  // ============================================================
  // 21. الوضع المظلم
  // ============================================================
  document
    .getElementById("darkModeToggle")
    .addEventListener("change", function () {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("darkMode", this.checked ? "true" : "false");
    });

  // استعادة الوضع المظلم
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("darkModeToggle").checked = true;
  }

  // ============================================================
  // 22. بحث صوتي
  // ============================================================
  var voiceBtn = document.getElementById("voiceBtn");

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    var SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
    recognition.lang = "ar-EG";
    recognition.continuous = false;

    voiceBtn.addEventListener("click", function () {
      if (this.classList.contains("recording")) {
        recognition.stop();
        return;
      }

      showToast("🎤 تحدث الآن...");
      this.classList.add("recording");
      recognition.start();
    });

    recognition.onresult = function (event) {
      var transcript = event.results[0][0].transcript;
      document.getElementById("searchInput").value = transcript;
      voiceBtn.classList.remove("recording");
      searchAddress(transcript);
    };

    recognition.onerror = function (event) {
      voiceBtn.classList.remove("recording");
      if (event.error !== "aborted") {
        showToast("❌ لم يتم التعرف على الصوت، حاول مرة أخرى");
      }
    };

    recognition.onend = function () {
      voiceBtn.classList.remove("recording");
    };
  } else {
    voiceBtn.style.display = "none";
  }

  // ============================================================
  // 23. ربط الأزرار الرئيسية
  // ============================================================
  // زر البحث
  document.getElementById("searchBtn").addEventListener("click", function () {
    var input = document.getElementById("searchInput");
    searchAddress(input.value);
  });

  document
    .getElementById("searchInput")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchAddress(e.target.value);
      }
    });

  // إغلاق اللوحات
  document.getElementById("closePanel").addEventListener("click", function () {
    document.getElementById("resultsPanel").classList.remove("open");
  });

  // ============================================================
  // 24. تحميل افتراضي
  // ============================================================
  setTimeout(function () {
    // تحميل الخدمة الافتراضية
    loadService("hospital");

    // تحديث الإحصائيات
    var center = map.getCenter();
    updateQuickStats(center.lat, center.lng);

    console.log("✅ التطبيق جاهز للاستخدام");
  }, 1000);

  // ============================================================
  // 25. معالجة الأخطاء
  // ============================================================
  window.onerror = function (msg, url, line, col, error) {
    console.error("❌ خطأ:", msg);
    return true;
  };

  // ============================================================
  // 26. Overlay للألواح الجانبية
  // ============================================================
  var overlay = document.createElement("div");
  overlay.id = "overlay";
  document.body.appendChild(overlay);

  overlay.addEventListener("click", function () {
    closeAllPanels();
    this.classList.remove("show");
  });

  // إغلاق القائمة عند النقر خارجها
  document.addEventListener("click", function (e) {
    var menu = document.getElementById("sideMenu");
    var menuBtn = document.getElementById("menuBtn");
    if (
      menu.classList.contains("open") &&
      !menu.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      menu.classList.remove("open");
      overlay.classList.remove("show");
    }
  });

  console.log("✅ التطبيق يعمل بنجاح! 🎉");
}); // نهاية DOMContentLoaded
