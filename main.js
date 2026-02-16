const API_URL = "http://127.0.0.1:8000/generate-report";

document.getElementById("generateBtn").addEventListener("click", async () => {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const status = document.getElementById("status");
  const loaderOverlay = document.getElementById("loaderOverlay");

  if (!startDate) {
    status.innerText = "⚠️ Debes seleccionar una fecha inicial";
    status.style.color = "#e11d48";
    return;
  }

  status.innerText = "";
  loaderOverlay.classList.add("active");

  try {
    let url = `${API_URL}?date_from=${startDate}`;
    if (endDate) url += `&date_to=${endDate}`;

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `reporte_comisiones_${startDate}${endDate ? "_" + endDate : ""}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(downloadUrl);

    status.innerText = "✅ Reporte descargado correctamente";
    status.style.color = "#059669";
  } catch (error) {
    console.error(error);
    status.innerText = "❌ Error generando el reporte";
    status.style.color = "#e11d48";
  } finally {
    loaderOverlay.classList.remove("active");
  }
});
