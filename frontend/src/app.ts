var apiUrl = 'http://localhost:3000/api';
var currentResult: any = null;

function calculate(): any {
    var d: any = (document.getElementById('distance') as HTMLInputElement).value;
    var t: any = (document.getElementById('transport') as HTMLSelectElement).value;
    var ct: any = (document.getElementById('carType') as HTMLSelectElement).value;
    var p: any = (document.getElementById('passengers') as HTMLInputElement).value;
    var c: any = (document.getElementById('country') as HTMLSelectElement).value;

    fetch(apiUrl + '/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            distance: parseFloat(d),
            transport: t,
            carType: ct,
            passengers: parseInt(p) || 1,
            country: c
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        currentResult = data.data;

        var resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.style.display = 'block';
        }

        var resultCo2 = document.getElementById('resultCo2');
        if (resultCo2) {
            resultCo2.innerHTML = 'CO2: ' + data.data.co2.toFixed(2) + ' kg';
        }

        var resultLabel = document.getElementById('resultLabel');
        if (resultLabel) {
            resultLabel.innerHTML = data.data.label;
            // Removing all classes and adding new one - inefficient
            resultLabel.className = 'result-label label-' + data.data.label;
        }

        window.scrollTo(0, document.body.scrollHeight);
    })
    .catch(function(error) {
        alert('Error!');
        console.log(error);
    });
}

function compare(): any {
    var d1: any = (document.getElementById('distance1') as HTMLInputElement).value;
    var t1: any = (document.getElementById('transport1') as HTMLSelectElement).value;
    var d2: any = (document.getElementById('distance2') as HTMLInputElement).value;
    var t2: any = (document.getElementById('transport2') as HTMLSelectElement).value;

    fetch(apiUrl + '/compare', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            trip1: {
                distance: parseFloat(d1),
                transport: t1,
                carType: 'thermal',
                passengers: 1,
                country: 'France'
            },
            trip2: {
                distance: parseFloat(d2),
                transport: t2,
                carType: 'thermal',
                passengers: 1,
                country: 'France'
            }
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        var compareResultDiv = document.getElementById('compareResult');
        if (compareResultDiv) {
            compareResultDiv.style.display = 'block';
        }

        var compareContent = document.getElementById('compareContent');
        if (compareContent) {
            var html = '<div style="margin-bottom: 10px;"><strong>Trip 1:</strong> ' +
                       data.trip1.co2.toFixed(2) + ' kg CO2 (' + data.trip1.label + ')</div>';
            html += '<div style="margin-bottom: 10px;"><strong>Trip 2:</strong> ' +
                    data.trip2.co2.toFixed(2) + ' kg CO2 (' + data.trip2.label + ')</div>';
            html += '<div style="margin-top: 20px; font-size: 18px; font-weight: bold;">';

            if (data.winner === 'trip1') {
                html += 'Trip 1 is more ecological!';
            } else if (data.winner === 'trip2') {
                html += 'Trip 2 is more ecological!';
            } else {
                html += 'Both trips have equal CO2 emissions!';
            }

            html += '</div>';
            html += '<div style="margin-top: 10px;">Difference: ' +
                    data.difference.toFixed(2) + ' kg CO2</div>';

            compareContent.innerHTML = html;
        }

        window.scrollTo(0, document.body.scrollHeight);
    })
    .catch(function(error) {
        alert('Error!');
        console.log(error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var transportSelect = document.getElementById('transport');
    if (transportSelect) {
        transportSelect.addEventListener('change', function() {
            var val = (transportSelect as HTMLSelectElement).value;

            var carTypeSection = document.getElementById('carTypeSection');
            var passengersSection = document.getElementById('passengersSection');
            var countrySection = document.getElementById('countrySection');

            if (val === 'car') {
                if (carTypeSection) carTypeSection.style.display = 'block';
                if (passengersSection) passengersSection.style.display = 'block';
                if (countrySection) countrySection.style.display = 'block';
            } else if (val === 'train') {
                if (carTypeSection) carTypeSection.style.display = 'none';
                if (passengersSection) passengersSection.style.display = 'none';
                if (countrySection) countrySection.style.display = 'block';
            } else {
                if (carTypeSection) carTypeSection.style.display = 'none';
                if (passengersSection) passengersSection.style.display = 'none';
                if (countrySection) countrySection.style.display = 'none';
            }
        });
    }

    fetch(apiUrl + '/history')
        .then(function(response) { return response.json(); })
        .then(function(data) { console.log('History loaded:', data); })
        .catch(function(error) { console.log('Error loading history'); });

    fetch(apiUrl + '/stats')
        .then(function(response) { return response.json(); })
        .then(function(data) { console.log('Stats loaded:', data); })
        .catch(function(error) { console.log('Error loading stats'); });
});

(window as any).calculate = calculate;
(window as any).compare = compare;

function log() {
    console.log('Logging stuff');
}