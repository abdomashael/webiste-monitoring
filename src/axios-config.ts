import axios from "axios";

export default class AxiosConfig {
    public static addTimeConfigurations = () => {
        axios.interceptors.request.use((config) => {
            config.metadata = {durationInSeconds: null, endTime: null, startTime: new Date()}
            return config;
        }, (error) => {
            return Promise.reject(error);
        });

        axios.interceptors.response.use((response) => {
            response.config.metadata.endTime = new Date()
            response.config.metadata.durationInSeconds = Number(response.config.metadata.endTime.valueOf() - response.config.metadata.startTime.valueOf()) / 1000
            return response;
        }, (error) => {
            return Promise.reject(error);
        });
    }
}
