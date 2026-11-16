// =====================================================
//  EDIT SEMUA MAKLUMAT MAJLIS DI SINI
// =====================================================
window.WEDDING = {
  title: "Walimatul Urus Keluarga Idris",

  // Pasangan: nama pendek (cover) + nama penuh (kad)
  couples: [
    { a: "Maryam", b: "Putra",  full: ["Siti Maryam Binti Haji Idris", "Putra Shah Aizat Bin Hainurabahari"] },
    { a: "Ismail", b: "Balkis", full: ["Ismail Bin Haji Idris", "Siti Noor Balkis Binti Peermohamed"] },
    { a: "Aisyah", b: "Syabil", full: ["Siti Aisyah Binti Haji Idris", "Muhammad Syabil Jihad Bin Khairi Khalid"] }
  ],

  host: "Haji Idris Bin Haji Ismail & Keluarga",
  hostNote: "(Wakil Allahyarhamah Hajah Masita Abd Rashid)",

  // Tarikh & masa majlis (waktu Malaysia, +08:00)
  start: "2026-12-12T11:00:00+08:00",
  end:   "2026-12-12T15:00:00+08:00",
  coverDate: "12 . 12 . 2026",
  dayName: "SABTU",
  dayNum: "12",
  monthYear: "DISEMBER 2026",
  footNames: "Keluarga Haji Idris",
  heroDate: "12 . 12 . 2026",
  dateLong: "Sabtu, 12 Disember 2026",
  hijri: "3 Rejab 1448H",
  time: "11:00 pagi - 3:00 petang",

  venue: "Crystal White Event Hall",
  address: "Klang, Selangor",
  parkingNote: "Nota: Parkir dikenakan bayaran",
  mapsQuery: "Crystal White Event Hall Klang",

  // Kosongkan [] untuk sembunyikan seksyen Atur Cara
  programme: [],

  closing: "Semoga dengan kehadiran serta iringan doa restu para undangan yang dihormati akan menyerikan lagi majlis kami. InsyaAllah 🤍",

  // Doa: teks Arab + maknanya
  doa: [
    { ar: "بَارَكَ اللهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا<br>وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
      ms: "Semoga Allah memberkati kalian berdua, melimpahkan keberkatan ke atas kalian, dan menyatukan kalian dalam kebaikan.",
      src: "Riwayat Abu Daud dan at-Tirmizi" },
    { ar: "اللَّهُمَّ أَلِّفْ بَيْنَهُمَا<br>كَمَا أَلَّفْتَ بَيْنَ آدَمَ وَحَوَّاءَ",
      ms: "Ya Allah, satukanlah hati mereka berdua sebagaimana Engkau telah menyatukan hati Nabi Adam dan Hawa." }
  ],
  hashtag: "", // cth "#MajlisKeluargaIdris" — kosong = disembunyikan

  contacts: [
    { name: "Muhammad", role: "", phone: "601121318039" },
    { name: "Mu'az", role: "", phone: "601110855830" },
    { name: "Iqbal", role: "", phone: "60133688629" }
  ],

  banks: [
    { bank: "Touch 'n Go", holder: "Noradam Bin Ahmad", acc: "0123456789", color: "#1a5bb8" },
    { bank: "Maybank",     holder: "Noradam Bin Ahmad", acc: "512213355570", color: "#f5c400" },
    { bank: "OCBC Bank",   holder: "Noradam Bin Ahmad", acc: "7072371622", color: "#d71920" }
  ],

  wishlist: [
    { item: "Philips Hair Dryer BHC010/13", label: "Tempah Hadiah" },
    { item: "Dreamynight Home Clover", label: "Tempah Hadiah" },
    { item: "Philips Jar Rice Cooker HD3119/60", label: "Tempah Hadiah" },
    { item: "Philips Classic Dry Iron HD1172", label: "Tempah Hadiah" },
    { item: "PerySmith Vacuum Cleaner XS20", label: "Tempah Hadiah" },
    { item: "PHILIPS Stainless Steel Jug Kettle HD935", label: "Tempah Hadiah" },
    { item: "Tefal Cook & Clean 4 Pcs Cookware Set", label: "Tempah Hadiah" },
    { item: "IKEA Gift Card", label: "Beli Sekarang", url: "https://www.ikea.com/my/en/customer-service/services/gift-card/" }
  ],
  postal: "Noradam Bin Ahmad<br>0123456789<br>No. 4, Jalan Pahat,<br>Taman Gembira, Seksyen 40,<br>Shah Alam, Selangor",

  // Letak fail lagu di assets/lagu.mp3
  song: "assets/lagu.mp3?v=3",
  songTitle: "Lagu Latar Majlis",

  // Google Sheets: tampal URL "Web app" dari Apps Script di sini.
  // Kosong = RSVP & ucapan hanya disimpan dalam phone tetamu.
  sheetUrl: "https://script.google.com/macros/s/AKfycbwcYAazT-soCGPPdy0fNFJquSQdfK_UBo11yeZuRwHuIPhpSj13tm4DXGwBCnH1oYfD-A/exec",

  // Ucapan awal (kosong untuk majlis sebenar)
  seedWishes: [],
  seedStats: { yes: 0, no: 0 }
};
