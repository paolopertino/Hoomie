import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: true,
        themes: {
            light: {
                background: '#F5F5F5',
                appbar: '#FFC107',
                cards: '#DCDCDC',
                primary: '#FFC107',
                secondary: '#FFE082',
                error: '#FF5252',
                info: '#fceacc',
                success: '#4CAF50',
                warning: '#FFC107',
            },
            dark: {
                background: '#121212',
                appbar: '#272727',
                cards: '#1E1E1E',
                primary: '#FFE082',
                secondary: '#FFC107',
                error: '#FF5252',
                info: '#fceacc',
                success: '#4CAF50',
                warning: '#FFC107',
            },
        }
    }
});
