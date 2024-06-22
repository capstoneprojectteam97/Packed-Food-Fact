document.addEventListener('DOMContentLoaded', function () {
    const compareBtn = document.getElementById('compareBtn');
    const item1Select = document.getElementById('item1');
    const item2Select = document.getElementById('item2');
    const comparisonResults = document.getElementById('comparison-results');
    const comparisonChart = document.getElementById('comparisonChart').getContext('2d');
    let chartInstance;

    compareBtn.addEventListener('click', function (event) {
        event.preventDefault();

        const item1 = item1Select.value;
        const item2 = item2Select.value;

        if (!item1 || !item2) {
            alert('Please select both items to compare.');
            return;
        }

        fetch('food_data.csv')
            .then(response => response.text())
            .then(data => {
                const results = Papa.parse(data, { header: true });
                const items = results.data;

                const item1Data = items.find(item => item.Name === item1 && item.Details.includes('Nutritional Info:'));
                const item2Data = items.find(item => item.Name === item2 && item.Details.includes('Nutritional Info:'));

                if (!item1Data || !item2Data) {
                    alert('Nutritional information for one or both selected items is missing.');
                    return;
                }

                const item1Energy = parseEnergy(item1Data.Details);
                const item2Energy = parseEnergy(item2Data.Details);

                displayEnergyComparison(item1, item1Energy, item2, item2Energy);
                displayChart(item1, item1Energy, item2, item2Energy);
            })
            .catch(error => {
                console.error('Error fetching CSV data:', error);
                alert('Error fetching CSV data. Please try again.');
            });
    });

    function parseEnergy(details) {
        const nutritionalInfo = details.match(/Energy- ([^,]+)/);
        return nutritionalInfo ? nutritionalInfo[1] : 'N/A';
    }

    function displayEnergyComparison(item1, item1Energy, item2, item2Energy) {
        let tableHTML = `<table>
                            <tr>
                                <th>Nutrient</th>
                                <th>${item1}</th>
                                <th>${item2}</th>
                            </tr>
                            <tr>
                                <td>Energy</td>
                                <td>${item1Energy}</td>
                                <td>${item2Energy}</td>
                            </tr>
                          </table>`;

        comparisonResults.innerHTML = tableHTML;
    }

    function displayChart(item1, item1Energy, item2, item2Energy) {
        const energyValues = [parseFloat(item1Energy), parseFloat(item2Energy)];

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(comparisonChart, {
            type: 'bar',
            data: {
                labels: [item1, item2],
                datasets: [{
                    label: 'Energy (kcal)',
                    data: energyValues,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});
