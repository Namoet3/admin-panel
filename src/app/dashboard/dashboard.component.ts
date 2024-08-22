import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartType, ChartConfiguration } from 'chart.js/auto';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {DashboardService} from '../services/dashboard.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-chart-treemap';


interface User {
  Gpa: string;
  SubmissionDate: string;
}
type ProficiencyCounts = {
  'çok iyi': number;
  'iyi': number;
  'orta': number;
  'başlangıç': number;
};

type FilteredLanguages = {
  [key: string]: ProficiencyCounts;
};
type TreemapDataPoint = {
  label: string;
  value: number;
};



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective, CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy, RouterModule {
  data: any[] = [];
  isDropdownOpen: boolean = false;
  ageDistribution: number[] = [];
  gpaDistribution: number[] = [];
  cityDistribution: { [key: string]: number } = {};
  gpaDistributionByMonth: { month: string, avgGpa: number }[] = [];
  gpaByMonthChart: Chart | undefined;
  genderDistribution: { [key: string]: number } = {};
  genderChart: Chart | undefined;
  ageGroups: { [key: string]: number } = {};
  filteredLanguages: FilteredLanguages = {};
  languageProficiencyChart: Chart | undefined;
  educationDistribution: { [key: string]: number } = {};
  educationChart: Chart | undefined;
  treemapChart: Chart | undefined;
  ageDistributionByMonth: { month: string, avgAge: number }[] = [];
  popularTime: string = '';
  busiestDay: string = '';

  applicationsToday: number = 0;
  applicationsThisWeek: number = 0;
  pageVisitsToday: number = 0;
  pageVisitsThisWeek: number = 0;

  




  applicationProcess = [
    { step: 'Application Started', count: 100 },
    { step: 'Application Submitted', count: 90 },
    { step: 'Application Reviewed', count: 80 },
    { step: 'Application Accepted', count: 70 }
  ];
  funnelChart: Chart | undefined;

  ageChart!: Chart;
  gpaChart!: Chart;
  cityChart!: Chart;
  languageChart!: Chart;
  ageDistributionChart!: Chart;
  ageAverageChart!: Chart;


  constructor(private http: HttpClient, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchPopularTime();
    this.fetchBusiestDay();
    this.http.get<any[]>('https://localhost:5231/api/User').subscribe(
      data => {
        this.data = data;
        this.analyzeData();
        this.analyzeGpaByMonth();
        this.analyzeGenderDistribution();  
        this.analyzeLanguageProficiency();
        this.analyzeEducationLevels();
        this.createCharts();
        this.createGpaByMonthChart();
        this.createGenderChart();
        this.analyzeLanguageProficiency();
        this.createLanguageProficiencyChart();
        this.createEducationChart();
        this.createJobPositionsBarChart();
        this.analyzeAverageAgeByMonth();
        this.createAgeAverageChart();

        this.loadSummaryData();
        
        
        // this.createFunnelChart();
      },
      error => {
        console.error("API Error:", error);
      }
    );
  }
  fetchPopularTime(): void {
    this.http.get<any>('https://localhost:5231/api/User/applications/popular-time')
      .subscribe(response => {
        this.popularTime = response.timeRange; 
      }, error => {
        console.error('Error fetching popular time:', error);
      });
  }

  fetchBusiestDay(): void {
    this.http.get<any>('https://localhost:5231/api/User/applications/busiest-day')
      .subscribe(response => {
        this.busiestDay = response.day; 
      }, error => {
        console.error('Error fetching busiest day:', error);
      });
  }
  
  loadSummaryData(): void {
    this.dashboardService.getApplicationsToday().subscribe(data => {
        this.applicationsToday = data;
    });

    this.dashboardService.getApplicationsThisWeek().subscribe(data => {
        this.applicationsThisWeek = data;
    });

    this.dashboardService.getPageVisitsToday().subscribe(data => {
        this.pageVisitsToday = data;
    });

    this.dashboardService.getPageVisitsThisWeek().subscribe(data => {
        this.pageVisitsThisWeek = data;
    });



    // this.dashboardService.getPopularApplicationTime().subscribe(data => {
    //   this.popularApplicationTime = data;
    // });

    // this.dashboardService.getBusiestDay().subscribe(data => {
    //   this.busiestDay = data;
    // });
  }
  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  ngAfterViewInit() {
    this.createCharts();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  analyzeData() {
    if (this.data && Array.isArray(this.data)) {
      this.analyzeAgeDistribution();
      this.analyzeGpaDistribution();
      this.analyzeCityDistribution();
    } else {
      console.error("Data structure is not as expected or undefined.");
    }
  }

  analyzeAgeDistribution() {
    const currentDate = new Date();
    const ageGroups: { [key: string]: number } = {};
  
    this.ageDistribution = this.data.map((item: any) => {
      const birthDate = new Date(item.userDetails.birthdate);
      const age = currentDate.getFullYear() - birthDate.getFullYear();
      return age;
    });
  
    
    this.ageDistribution.forEach(age => {
      const ageGroup = `${Math.floor(age / 5) * 5}-${Math.floor(age / 5) * 5 + 4}`;
      ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
    });
  
    
    const orderedAgeGroups: { [key: string]: number } = {};
    for (let i = 0; i <= Math.max(...this.ageDistribution); i += 5) {
      const groupLabel = `${i}-${i + 4}`;
      orderedAgeGroups[groupLabel] = ageGroups[groupLabel] || 0;
    }
  
    this.ageGroups = orderedAgeGroups;
  }

  analyzeGpaDistribution() {
    this.gpaDistribution = this.data.map((item: any) => parseFloat(item.gpa));
  }

  analyzeCityDistribution() {
    const cityCounts: { [key: string]: number } = {};

    
    this.data.forEach((item: any) => {
        const city = item.userDetails.city;
        if (cityCounts[city]) {
            cityCounts[city]++;
        } else {
            cityCounts[city] = 1;
        }
    });

    // console.log("City Counts Before Limiting:", cityCounts);

    
    const limitedCityCounts = Object.entries(cityCounts)
        .sort(([, aCount], [, bCount]) => bCount - aCount)
        .slice(0, 20)
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {} as { [key: string]: number });

    this.cityDistribution = limitedCityCounts;

    // console.log("Filtered and Limited City Counts:", this.cityDistribution);
}

analyzeGpaByMonth() {
  const gpaByMonth: { [key: string]: number[] } = {};

  this.data.forEach((item: any) => {
      if (!item.gpa || !item.submissionDate) {
          return;  
      }

      
      const submissionDate = new Date(item.submissionDate);
      const submissionMonth = submissionDate.toLocaleString('default', { month: 'long'}); 
      const gpa = parseFloat(item.gpa);

      
      if (!gpaByMonth[submissionMonth]) {
          gpaByMonth[submissionMonth] = [];
      }
      gpaByMonth[submissionMonth].push(gpa);
  });

  
  this.gpaDistributionByMonth = Object.keys(gpaByMonth).map(month => {
      const gpas = gpaByMonth[month];
      return {
          month,
          avgGpa: gpas.reduce((a, b) => a + b, 0) / gpas.length
      };
  });

  
  const monthOrder = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  this.gpaDistributionByMonth.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

  console.log("GPA Distribution by Month:", this.gpaDistributionByMonth);  
}

  createCharts() {
    this.createAgeChart();
    this.createGpaChart();
    this.createCityChart();
  }

  createAgeChart() {
    const ctx = document.getElementById('ageChart') as HTMLCanvasElement;

    if (this.ageDistributionChart) {
        this.ageDistributionChart.destroy();
    }

    this.ageDistributionChart = new Chart(ctx, {
        type: 'bar' as ChartType,
        data: {
            labels: Object.keys(this.ageGroups),
            datasets: [{
                label: 'Yaş dağılımları',
                data: Object.values(this.ageGroups),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '5 yıl aralıklı yaş grupları'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Başvuru Sayısı'
                    }
                }
            }
        }
    });
}

  createGpaChart() {
    const ctx = document.getElementById('gpaChart') as HTMLCanvasElement;

    if (this.gpaChart) {
      this.gpaChart.destroy();
    }

    this.gpaChart = new Chart(ctx, {
      type: 'line' as ChartType,
      data: {
        labels: this.gpaDistribution.map((_, index) => `User ${index + 1}`),
        datasets: [{
          label: 'GPA Distribution',
          data: this.gpaDistribution,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      }
    });
  }

  createCityChart() {
    const ctx = document.getElementById('cityChart') as HTMLCanvasElement;

    if (this.cityChart) {
        this.cityChart.destroy();
    }

    this.cityChart = new Chart(ctx, {
        type: 'bar' as ChartType, 
        data: {
            labels: Object.keys(this.cityDistribution),
            datasets: [{
                label: 'Şehirlerden başvuru sayıları',
                data: Object.values(this.cityDistribution),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

  createGpaByMonthChart() {
    const ctx = document.getElementById('gpaByMonthChart') as HTMLCanvasElement;
  
    if (this.gpaByMonthChart) {
      this.gpaByMonthChart.destroy();
    }
  
    this.gpaByMonthChart = new Chart(ctx, {
      type: 'line' as ChartType,
      data: {
        labels: this.gpaDistributionByMonth.map(item => item.month),  
        datasets: [{
          label: 'Aylara göre ortalama not dağılımları',
          data: this.gpaDistributionByMonth.map(item => item.avgGpa),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: false
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  analyzeGenderDistribution() {
    const genderCounts: { [key: string]: number } = {
        'Kadın': 0,
        'Erkek': 0,
        'Diğer': 0
    };
  
    this.data.forEach((item: any) => {
        const gender = item.userDetails.gender.trim();
        if (gender === 'Kadın' || gender === 'Erkek' || gender === 'Diğer') {
            genderCounts[gender]++;
        }
    });
  
    this.genderDistribution = genderCounts;

    // console.log("Filtered Gender Distribution:", this.genderDistribution);
}

createGenderChart() {
  const ctx = document.getElementById('genderChart') as HTMLCanvasElement;

  if (this.genderChart) {
      this.genderChart.destroy();
  }

  const labels = Object.keys(this.genderDistribution);
  const data = Object.values(this.genderDistribution);

  this.genderChart = new Chart(ctx, {
      type: 'doughnut' as ChartType,
      data: {
          labels: labels,
          datasets: [{
              data: data,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',  
                  'rgba(54, 162, 235, 0.2)',  
                  'rgba(255, 206, 86, 0.2)'   
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          plugins: {
              
              datalabels: {
                  formatter: (value: number, context: any) => {
                      const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                      const percentage = (value / total * 100).toFixed(1);
                      return `${percentage}%`;
                  },
                  color: '#00000',
              }
          }
      },
      plugins: [ChartDataLabels]  
  });
}
  // createFunnelChart() {
  //   const ctx = document.getElementById('funnelChart') as HTMLCanvasElement;
  
  //   if (this.funnelChart) {
  //     this.funnelChart.destroy();
  //   }
  
  //   this.funnelChart = new Chart(ctx, {
  //     type: 'funnel' as ChartType,  
  //     data: {
  //       labels: this.applicationProcess.map(item => item.step),
  //       datasets: [{
  //         data: this.applicationProcess.map(item => item.count),
  //         backgroundColor: [
  //           'rgba(54, 162, 235, 0.2)',
  //           'rgba(255, 206, 86, 0.2)',
  //           'rgba(75, 192, 192, 0.2)',
  //           'rgba(255, 99, 132, 0.2)'
  //         ],
  //         borderColor: [
  //           'rgba(54, 162, 235, 1)',
  //           'rgba(255, 206, 86, 1)',
  //           'rgba(75, 192, 192, 1)',
  //           'rgba(255, 99, 132, 1)'
  //         ],
  //         borderWidth: 1
  //       }]
  //     },
  //     options: {
  //       maintainAspectRatio: false,
  //       responsive: true,
  //       scales: {
  //         y: {
  //           beginAtZero: true,
  //           title: {
  //             display: true,
  //             text: 'Number of Users'
  //           }
  //         },
  //         x: {
  //           title: {
  //             display: true,
  //             text: 'Application Process Stage'
  //           }
  //         }
  //       }
  //     }
  //   });
  // }
  analyzeLanguageProficiency() {
    const languageCounts: { [key: string]: ProficiencyCounts } = {};

    this.data.forEach((user: any) => {
        user.languages.forEach((lang: any) => {
            const normalizedProficiency = lang.proficiency.trim().toLowerCase() as keyof ProficiencyCounts;
            
            const languageName = lang.languageName.trim();

            if (!languageCounts[languageName]) {
                languageCounts[languageName] = {
                    'çok iyi': 0,
                    'iyi': 0,
                    'orta': 0,
                    'başlangıç': 0
                };
            }

            if (normalizedProficiency in languageCounts[languageName]) {
                languageCounts[languageName][normalizedProficiency]++;
            } else {
            }
        });
    });

    // console.log("Language Counts Before Filtering:", languageCounts);

    
    this.filteredLanguages = Object.keys(languageCounts)
        .filter(language => Object.values(languageCounts[language]).reduce((sum, count) => sum + count, 0) >= 2)
        .reduce((obj: any, key: string) => {
            obj[key] = languageCounts[key];
            return obj;
        }, {});

    // console.log("Filtered Languages:", this.filteredLanguages);
}


createLanguageProficiencyChart() {
    const ctx = document.getElementById('languageProficiencyChart') as HTMLCanvasElement;

    if (this.languageProficiencyChart) {
        this.languageProficiencyChart.destroy();
    }

    const labels = Object.keys(this.filteredLanguages);
    const datasets = [
        {
            label: 'Çok İyi',
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            data: labels.map(label => this.filteredLanguages[label]['çok iyi'] || 0)
        },
        {
            label: 'İyi',
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            data: labels.map(label => this.filteredLanguages[label]['iyi'] || 0)
        },
        {
            label: 'Orta',
            backgroundColor: 'rgba(255, 206, 86, 0.6)',
            data: labels.map(label => this.filteredLanguages[label]['orta'] || 0)
        },
        {
            label: 'Başlangıç',
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            data: labels.map(label => this.filteredLanguages[label]['başlangıç'] || 0)
        }
    ];

    // console.log("Labels:", labels);
    // console.log("Dataset for 'Çok İyi':", datasets[0].data);
    // console.log("Dataset for 'İyi':", datasets[1].data);
    // console.log("Dataset for 'Orta':", datasets[2].data);
    // console.log("Dataset for 'Başlangıç':", datasets[3].data);

    this.languageProficiencyChart = new Chart(ctx, {
        type: 'bar' as ChartType,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1 
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}
analyzeEducationLevels() {
  const educationCounts: { [key: string]: number } = {
      'İlkokul': 0,
      'Ortaokul': 0,
      'Lise': 0,
      'Ön Lisans': 0,
      'Lisans': 0,
      'Yüksek Lisans': 0,
      'Doktora': 0
  };

  this.data.forEach((item: any) => {
      const educationLevel = item.educationLevel?.trim();
      if (educationLevel && educationCounts.hasOwnProperty(educationLevel)) {
          educationCounts[educationLevel]++;
      } else {
      }
  });

  this.educationDistribution = educationCounts;

  // console.log("Education Levels Distribution:", this.educationDistribution);
}
createEducationChart() {
  const ctx = document.getElementById('educationChart') as HTMLCanvasElement;

  if (this.educationChart) {
      this.educationChart.destroy();
  }

  const labels = Object.keys(this.educationDistribution);
  const data = Object.values(this.educationDistribution);

  this.educationChart = new Chart(ctx, {
      type: 'pie' as ChartType,
      data: {
          labels: labels,
          datasets: [{
              data: data,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',   
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)',
                  'rgba(201, 203, 207, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                  'rgba(201, 203, 207, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          plugins: {
              
              datalabels: {
                  formatter: (value: number, context: any) => {
                      const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                      const percentage = (value / total * 100).toFixed(1);
                      return `${percentage}%`;
                  },
                  color: '#000000',
              }
          }
      },
      plugins: [ChartDataLabels]  
  });
}
createJobPositionsBarChart(): void {
  const jobPositions = this.extractJobPositions();
  const frequencies = this.calculateFrequencies(jobPositions);

  const ctx = document.getElementById('jobPositionsChart') as HTMLCanvasElement;

  if (ctx) {
    if (this.treemapChart) {
      this.treemapChart.destroy();
    }

    
    const top25Entries = Object.entries(frequencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15);
    
    const labels = top25Entries.map(([position]) => position);
    const data = top25Entries.map(([, count]) => count);

    this.treemapChart = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'İş Pozisyonları',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }]
      },
      options: {
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Başvuran Pozisyon Sayısı'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: any) => `${context.label}: ${context.raw}`
            }
          }
        }
      }
    });
  } else {
    console.error("Canvas element not found");
  }
}

extractJobPositions(): string[] {
  return this.data
    .flatMap(user => user.jobExperiences || [])
    .map(job => job.position);
}

calculateFrequencies(positions: string[]): { [key: string]: number } {
  return positions.reduce((acc, position) => {
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
}
analyzeAverageAgeByMonth() {
  const ageByMonth: { [key: string]: number[] } = {};

  const currentDate = new Date();

  this.data.forEach((item: any) => {
      if (!item.userDetails.birthdate || !item.submissionDate) {
          console.warn("Skipping entry due to missing Birthdate or Submission Date:", item);
          return;
      }

      const submissionDate = new Date(item.submissionDate);
      const submissionMonth = submissionDate.toLocaleString('default', { month: 'long'});
      const birthDate = new Date(item.userDetails.birthdate);
      const age = currentDate.getFullYear() - birthDate.getFullYear();

      if (!ageByMonth[submissionMonth]) {
          ageByMonth[submissionMonth] = [];
      }
      ageByMonth[submissionMonth].push(age);
  });

  this.ageDistributionByMonth = Object.keys(ageByMonth).map(month => {
      const ages = ageByMonth[month];
      return {
          month,
          avgAge: ages.reduce((a, b) => a + b, 0) / ages.length
      };
  });

  
  const monthOrder = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  this.ageDistributionByMonth.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

  // console.log("Average Age Distribution by Month:", this.ageDistributionByMonth);
}
createAgeAverageChart() {
  const ctx = document.getElementById('ageAverageChart') as HTMLCanvasElement;

  if (this.ageAverageChart) {
      this.ageAverageChart.destroy();
  }

  this.ageAverageChart = new Chart(ctx, {
      type: 'line' as ChartType,
      data: {
          labels: this.ageDistributionByMonth.map(item => item.month),
          datasets: [{
              label: 'Aylara göre yaş dağılımları',
              data: this.ageDistributionByMonth.map(item => item.avgAge),
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true,
                  title: {
                      display: true,
                      text: 'Ortalama Yaş'
                  }
              },
              x: {
                  title: {
                      display: true,
                      text: 'Aylar'
                  }
              }
          }
      }
  });
}



  

destroyCharts() {
  if (this.ageDistributionChart) {
      this.ageDistributionChart.destroy();
  }
  if (this.ageAverageChart) {
      this.ageAverageChart.destroy();
  }
  if (this.gpaChart) {
      this.gpaChart.destroy();
  }
  if (this.cityChart) {
      this.cityChart.destroy();
  }
  if (this.gpaByMonthChart) {
      this.gpaByMonthChart.destroy();
  }
  if (this.genderChart) {
      this.genderChart.destroy();
  }
  if (this.treemapChart) {
      this.treemapChart.destroy();
  }
}
}
