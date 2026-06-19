import axiosInstance from "@/lib/axios";
import type { IMeal, IMealCreateInput, IMealUpdateInput } from "@/types/meals.types";

class MealsService {
    async getMeals(): Promise<IMeal[]> {
        const response = await axiosInstance.get("/meals");
        return response.data;
    }

    async getMeal(id: string): Promise<IMeal> {
        const response = await axiosInstance.get(`/meals/${id}`);
        return response.data;
    }

    async createMeal(data: IMealCreateInput): Promise<IMeal> {
        const response = await axiosInstance.post("/meals", data);
        return response.data;
    }

    async updateMeal(id: string, data: IMealUpdateInput): Promise<IMeal> {
        const response = await axiosInstance.put(`/meals/${id}`, data);
        return response.data;
    }

    async deleteMeal(id: string): Promise<IMeal> {
        const response = await axiosInstance.delete(`/meals/${id}`);
        return response.data;
    }
}

export default new MealsService();
