const xValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const yValues = [50000, 200000, 150000, 200000, 300000, 320000, 340000, 390000, 340000, 420000];

const ctx = document.getElementById('myChart');

new Chart(ctx, {
    type: "line",
    data: {
        labels: xValues,
        datasets: [{
            fill: false,
            lineTension: 0.4,
            backgroundColor: "rgba(0,0,0,1.0)",
            borderColor: "rgba(0,0,0,0.2)",
            data: yValues
        }]
    },
    options: {
        maintainAspectRatio: false,
        plugins: {
            legend: {display:false},
            title: {
                display: false,
                // text: "Growth Over Time",
                // font: {size:16}
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Years"
                }
            },
            y: {
                title: {
                    display: true,
                    text: "Amount ($)"
                }
            }
        }
    }
});