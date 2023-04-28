import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more';
import exporting from 'highcharts/modules/exporting';
import { SeriesOptionsType } from 'highcharts';

HC_more(Highcharts);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private http: HttpClient, private authService: AuthService) {}
  title = 'him-dashboard';
  channelMetricsurl = 'https://zhil.mohz.go.tz/api/metrics/channels';
  channelsurl = 'https://zhil.mohz.go.tz/api/channels';
  options = {
    apiURL: 'https://zhil.mohz.go.tz/api',
    username: 'admin@mohz.go.tz',
    password: 'zhilsAdmin@zdhs-znz2',
  };

  channels: {
    name: string;
    description: string;
    totalTransactions: number;
    completedTransactions: number;
    sucessTransactions: number;
    failedTransactions: number;
  }[] = [];

  summary: {
    total: number;
    successfull: number;
    completed: number;
    failed: number;
  } = {
    total: 0,
    successfull: 0,
    completed: 0,
    failed: 0,
  };

  Highcharts = Highcharts;
  chartOptions: any;
  showChart = false;
  selectedFilterMode = '1M';
  loading = false;

  ngOnInit() {
    this.getData().then();
  }

  drawMetricChart() {
    const channelsData = this.channels.filter(c => c.totalTransactions > 0);
    const data: SeriesOptionsType[] = [
      {
        name: 'Total transactions',
        color: '#438eff',
        type: 'column',
        data: channelsData.map((c) => c.totalTransactions),
      },
      {
        name: 'Successful transactions',
        color: 'rgb(66, 179, 66)',
        type: 'column',
        data: channelsData.filter(c => c.totalTransactions > 0).map((c) => c.sucessTransactions),
      },
      {
        name: 'Failed transactions',
        color: 'rgb(250, 52, 52)',
        type: 'column',
        data: channelsData.filter(c => c.totalTransactions > 0).map((c) => c.failedTransactions),
      },
    ];
    const options = {
      chart: {
        type: 'bar',
      },
      title: {
        text: 'Use case summary',
      },
      subtitle: {
        text: 'A summary showing transactions status per usecase',
      },
      xAxis: {
        categories: channelsData.map((c) => c.name),
        crosshair: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Number of transactions',
        },
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat:
          '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
      },
      series: data,
    };
    this.chartOptions = options;
    setTimeout(() => {
      this.showChart = true;
    }, 100);
  }

  async getChannels(object: any) {
    const channels = await firstValueFrom(
      this.http.get(this.channelsurl, {
        headers: {
          ...object,
        },
      })
    );
    return channels;
  }

  async getChannelMetrics(object: any, start: string, end: string) {
    const url = this.channelMetricsurl + `?startDate=${start}&endDate=${end}`;
    const response = await firstValueFrom(
      this.http.get(url, {
        headers: {
          ...object,
        },
      })
    );
    return response;
  }

  async getData(
    start = moment().subtract(30, 'd').format('YYYY-MM-DDTHH:mm:ss'),
    end = moment().format('YYYY-MM-DDTHH:mm:ss')
  ) {
    this.loading = true;
    // const response =
    this.channels = [];
    this.summary = {
      total: 0,
      successfull: 0,
      completed: 0,
      failed: 0,
    };
    const object = await this.authService.genAuthHeaders(this.options);
    const metrics: any = await this.getChannelMetrics(object, start, end);
    const channels: any = await this.getChannels(object);
    console.log('object', channels);
    for (const channel of channels) {
      const metric = metrics.find((m: any) => m._id.channelID === channel._id);
      this.channels.push({
        name: channel.name,
        description: channel.description,
        totalTransactions: metric ? metric.total : 0,
        failedTransactions: metric ? metric.failed + metric.completed : 0,
        sucessTransactions: metric ? metric.successful : 0,
        completedTransactions: metric ? metric.completed : 0,
      });
    }
    for (const metric of metrics) {
      this.summary.total += metric.total;
      this.summary.successfull += metric.successful;
      this.summary.completed += metric.completed;
      this.summary.failed += metric.failed + metric.completed;
    }

    this.drawMetricChart();
    console.log('response object', {
      metrics,
      channels: this.channels,
    });
    this.loading = false;
  }

  async onHr() {
    this.selectedFilterMode = '1hr'
    await this.getData(
      moment().subtract(1, 'h').format('YYYY-MM-DDTHH:mm:ss'),
      moment().format('YYYY-MM-DDTHH:mm:ss')
    );
  }

  async onDay() {
    this.selectedFilterMode = '1d'
    await this.getData(
      moment().subtract(1, 'd').format('YYYY-MM-DDTHH:mm:ss'),
      moment().format('YYYY-MM-DDTHH:mm:ss')
    );
  }

  async onWeek() {
    this.selectedFilterMode = '1w'
    await this.getData(
      moment().subtract(1, 'w').format('YYYY-MM-DDTHH:mm:ss'),
      moment().format('YYYY-MM-DDTHH:mm:ss')
    );
  }

  async onMonth() {
    this.selectedFilterMode = '1M'
    await this.getData(
      moment().subtract(1, 'M').format('YYYY-MM-DDTHH:mm:ss'),
      moment().format('YYYY-MM-DDTHH:mm:ss')
    );
  }

  async onYear(years = 1) {
    this.selectedFilterMode = `${years}y`
    await this.getData(
      moment().subtract(years, 'y').format('YYYY-MM-DDTHH:mm:ss'),
      moment().format('YYYY-MM-DDTHH:mm:ss')
    );
  }
}
