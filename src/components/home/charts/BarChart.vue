<script>
import { Bar } from "vue-chartjs";

export default {
  name: "BarGraph",
  extends: Bar,
  props: {
    label: {
      type: String,
    },
    xAxisLabel: {
      type: Array,
    },
    chartData: {
      type: Array,
      required: false,
      default: null,
    },
    personData: {
      type: Array,
      required: false,
      default: null,
    },
    options: {
      type: Object,
    },
  },
  data() {
    return {
      gradient: null,
      gradient2: null,
    };
  },
  mounted() {
    this.gradient = this.$refs.canvas.getContext("2d").createLinearGradient(0, 0, 0, 450);
    this.gradient.addColorStop(0, "rgba(255, 224,130, 1)");
    this.gradient.addColorStop(0.5, "rgba(255, 224, 130, 0.4)");
    this.gradient.addColorStop(1, "rgba(255, 224, 130, 0)");
    this.gradient2 = this.$refs.canvas
      .getContext("2d")
      .createLinearGradient(0, 0, 0, 450);
    this.gradient2.addColorStop(0, "rgba(200, 0,30, 1)");
    this.gradient2.addColorStop(0.7, "rgba(200, 0, 30, 0.4)");
    this.gradient2.addColorStop(1, "rgba(200, 0, 30, 0)");

    this.renderChart(
      {
        labels: this.xAxisLabel,
        datasets: [
          {
            label: this.label,
            data: this.chartData,
            backgroundColor: this.gradient2,
          },
          {
            label: "Andamento spese personali",
            data: this.personData,
            backgroundColor: this.gradient,
          },
        ],
      },
      this.options
    );
  },
};
</script>
