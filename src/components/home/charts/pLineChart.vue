<script>
import { Line } from "vue-chartjs";

export default {
  name: "pLineGraph",
  extends: Line,
  props: {
    label: {
      type: String,
    },
    xAxisLabel: {
      type: Array,
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
    };
  },
  mounted() {
    this.gradient = this.$refs.canvas.getContext("2d").createLinearGradient(0, 0, 0, 450);
    this.gradient.addColorStop(0, "rgba(255, 224,130, 1)");
    this.gradient.addColorStop(0.5, "rgba(255, 224, 130, 0.4)");
    this.gradient.addColorStop(1, "rgba(255, 224, 130, 0)");

    this.renderChart(
      {
        labels: this.xAxisLabel,
        datasets: [
          {
            label: this.label,
            data: this.personData,
            backgroundColor: this.gradient,
            pointBackgroundColor: "white",
            borderWidth: 1,
            pointBorderColor: "#FFFFFF",
          },
        ],
      },
      this.options
    );
  },
};
</script>
