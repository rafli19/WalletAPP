hooks/ itu untuk menyimpan custom hooks — fungsi yang mengandung logic React seperti useState, useEffect, dll, supaya tidak perlu ditulis berulang-ulang di setiap page.
Di project ini ada 2:

useToast.js → logic untuk munculkan notifikasi toast (sukses/error) — dipakai di Topup.jsx, Transfer.jsx, Dashboard.jsx
useWallet.js → logic untuk fetch saldo dari API — dipakai di Dashboard.jsx

Tanpa hooks, kode yang sama harus ditulis ulang di setiap file yang butuh toast atau saldo. Dengan hooks, cukup panggil useToast() atau useWallet() aja.