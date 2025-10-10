import apiClient from "../lib/axios";
import {
	PreBookingStatus,
	type ConvertLeadToPreBookingDto,
	type ConvertPreBookingToBookingDto,
	type CreateCustomerFromPreBookingDto,
	type PreBookingResponseDto,
	type PreBookingStatsDto,
	type PreBookingSummaryDto,
	type UpdatePreBookingDto,
	type UpdatePreBookingPackageDto,
	type UpdateTemporaryCustomerDetailsDto,
} from "../types/pre-booking.types";

export const preBookingService = {
	// Convert lead to pre-booking
	convertLeadToPreBooking: async (
		data: ConvertLeadToPreBookingDto
	): Promise<PreBookingResponseDto> => {
		const response = await apiClient.post("/pre-bookings/convert-lead", data);
		return response.data;
	},

	// Update package and dates
	updatePackageAndDates: async (
		id: string,
		data: UpdatePreBookingPackageDto
	): Promise<PreBookingResponseDto> => {
		const response = await apiClient.patch(`/pre-bookings/${id}/package-dates`, data);
		return response.data;
	},

	// Update temporary customer details
	updateTemporaryCustomerDetails: async (
		id: string,
		data: UpdateTemporaryCustomerDetailsDto
	): Promise<PreBookingResponseDto> => {
		const response = await apiClient.patch(
			`/pre-bookings/${id}/temporary-customer-details`,
			data
		);
		return response.data;
	},

	// Create customer from pre-booking
	createCustomerFromPreBooking: async (
		id: string,
		data: CreateCustomerFromPreBookingDto
	): Promise<PreBookingResponseDto> => {
		const response = await apiClient.post(
			`/pre-bookings/${id}/create-customer`,
			data
		);
		return response.data;
	},

	// Convert to booking
	convertToBooking: async (
		id: string,
		data: ConvertPreBookingToBookingDto
	): Promise<PreBookingResponseDto> => {
		const response = await apiClient.post(
			`/pre-bookings/${id}/convert-to-booking`,
			data
		);
		return response.data;
	},

	// Get all pre-bookings
	getAll: async (
		status?: PreBookingStatus,
		limit?: number,
		offset?: number
	): Promise<PreBookingSummaryDto[]> => {
		const params = new URLSearchParams();
		if (status) params.append("status", status);
		if (limit) params.append("limit", limit.toString());
		if (offset) params.append("offset", offset.toString());

		const response = await apiClient.get(`/pre-bookings?${params.toString()}`);
		return response.data;
	},

	// Get one pre-booking
	getOne: async (id: string): Promise<PreBookingResponseDto> => {
		const response = await apiClient.get(`/pre-bookings/${id}`);
		return response.data;
	},

	// Update pre-booking
	update: async (
		id: string,
		data: UpdatePreBookingDto
	): Promise<PreBookingResponseDto> => {
		const response = await apiClient.patch(`/pre-bookings/${id}`, data);
		return response.data;
	},

	// Cancel pre-booking
	cancel: async (id: string): Promise<PreBookingResponseDto> => {
		const response = await apiClient.patch(`/pre-bookings/${id}/cancel`);
		return response.data;
	},

	// Delete pre-booking
	delete: async (id: string): Promise<void> => {
		await apiClient.delete(`/pre-bookings/${id}`);
	},

	// Get statistics
	getStats: async (): Promise<PreBookingStatsDto> => {
		const response = await apiClient.get("/pre-bookings/stats/overview");
		return response.data;
	},
};
