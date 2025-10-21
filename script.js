// Utility for adding bus row to form
function addBusRow(bus='', arrival='', drop='') {
  const tbody = document.getElementById('busTimingTable').querySelector('tbody');
  const idx = Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const rowCount = tbody.rows.length + 1;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" name="bus[]" value="${bus || 'R'+rowCount}" required></td>
    <td><input type="time" name="arrival[]" value="${arrival}" required></td>
    <td><input type="time" name="drop[]" value="${drop}" required></td>
    <td><button type="button" onclick="removeBusRow(this)">Delete</button></td>
  `;
  tbody.appendChild(tr);
}

function removeBusRow(btn) {
  btn.closest('tr').remove();
}

window.onload = function() {
  if (document.getElementById('busTimingTable')) {
    for(let i=1; i<=14; i++) addBusRow('R'+i);
  }
}

// Handle form submission
if (document.getElementById('recordForm')) {
  document.getElementById('recordForm').addEventListener('submit', function(e){
    e.preventDefault();
    let busTimings = [];
    let buses = document.getElementsByName('bus[]');
    let arrivals = document.getElementsByName('arrival[]');
    let drops = document.getElementsByName('drop[]');
    for(let i=0; i<buses.length; i++) {
      busTimings.push({
        bus: buses[i].value,
        arrival: arrivals[i].value,
        drop: drops[i].value
      });
    }
    let entry = {
      date: document.getElementById('date').value,
      submitted: document.getElementById('submitted').value,
      busTimings,
      delay: document.getElementById('delay').value,
      drvExpected: document.getElementById('drvExpected').value,
      drvPresent: document.getElementById('drvPresent').value,
      guardExpected: document.getElementById('guardExpected').value,
      guardPresent: document.getElementById('guardPresent').value,
      spare1: document.getElementById('spare1').value,
      spare2: document.getElementById('spare2').value,
      incidents: document.getElementById('incidents').value,
      complaint: document.getElementById('complaint').value
    };
    let records = JSON.parse(localStorage.getItem('records') || '{}');
    records[entry.date] = entry;
    localStorage.setItem('records', JSON.stringify(records));
    alert('Saved!');
  });
}

// View by date
window.showRecord = function() {
  let date = document.getElementById('searchDate').value;
  let records = JSON.parse(localStorage.getItem('records') || '{}');
  let rec = records[date];
  if (rec) {
    let html = `<strong>Submitted By:</strong> ${rec.submitted}<br>`;
    html += `<strong>Drivers:</strong> Expected ${rec.drvExpected} / Present ${rec.drvPresent}<br>`;
    html += `<strong>Guards:</strong> Expected ${rec.guardExpected} / Present ${rec.guardPresent}<br>`;
    html += `<strong>Spare 1:</strong> ${rec.spare1} / <strong>Spare 2:</strong> ${rec.spare2}<br>`;
    html += `<strong>Delay Reason:</strong> ${rec.delay}<br><strong>Incidents:</strong> ${rec.incidents}<br><strong>Complaint:</strong> ${rec.complaint}<br>`;
    html += `<strong>Bus Timings:</strong><table border="1"><tr><th>Bus</th><th>Arrival</th><th>Drop</th></tr>`;
    for (let t of rec.busTimings) html += `<tr><td>${t.bus}</td><td>${t.arrival}</td><td>${t.drop}</td></tr>`;
    html += `</table>`;
    document.getElementById('recordDisplay').innerHTML = html;
  } else {
    document.getElementById('recordDisplay').innerHTML = "<em>No record found.</em>";
  }
};

// Export all records to CSV
window.exportCSV = function() {
  let records = JSON.parse(localStorage.getItem('records') || '{}');
  let rows = [
    ["Date","Submitted By","Bus Number","Arrival","Drop",
    "Reason for Delay","Drivers Expected","Drivers Present",
    "Guards Expected","Guards Present",
    "Spare 1","Spare 2","Incidents","Complaint"]
  ];
  for (let date in records) {
    let rec = records[date];
    for (let t of rec.busTimings) {
      rows.push([
        date, rec.submitted, t.bus, t.arrival, t.drop,
        rec.delay, rec.drvExpected, rec.drvPresent,
        rec.guardExpected, rec.guardPresent,
        rec.spare1, rec.spare2, rec.incidents, rec.complaint
      ]);
    }
  }
  let csv = rows.map(r => r.join(",")).join("\n");
  let blob = new Blob([csv], {type: "text/csv"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bus_report.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
