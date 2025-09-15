import { baseApi } from '../userBaseApi';

// Define types locally for now
export interface FeeStructure {
  id: string;
  grade: string;
  tuitionFee: number;
  transportationFee?: number;
  otherFees: Array<{ name: string; amount: number }>;
  totalFee: number;
  dueDate: string;
}

export interface OutstandingFee {
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface PaymentResult {
  id: string;
  status: string;
  amount: number;
  transactionId: string;
}

export const financialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fee Structure Management
    getFeeStructure: builder.query<FeeStructure[], void>({
      query: () => '/fees/structures',
      providesTags: ['Fee'],
    }),

    // Outstanding Fees
    getOutstandingFees: builder.query<OutstandingFee[], void>({
      query: () => '/fees/outstanding',
      providesTags: ['Fee'],
    }),

    // Process Payment
    processPayment: builder.mutation<PaymentResult, {
      studentId: string;
      amount: number;
      paymentMethod: string;
      feeType: string;
    }>({
      query: (paymentData) => ({
        url: '/fees/payments',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Fee'],
    }),

    // Additional financial endpoints can be added here
    getPaymentHistory: builder.query<PaymentResult[], { studentId?: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/fees/payments',
        method: 'GET',
        params,
      }),
      providesTags: ['Fee'],
    }),

    getFeeReports: builder.query<Record<string, unknown>, { schoolId: string; academicYear: string }>({
      query: ({ schoolId, academicYear }) => ({
        url: `/fees/reports/${schoolId}/${academicYear}`,
        method: 'GET',
      }),
      providesTags: ['Fee'],
    }),
  }),
});

export const {
  useGetFeeStructureQuery,
  useGetOutstandingFeesQuery,
  useProcessPaymentMutation,
  useGetPaymentHistoryQuery,
  useGetFeeReportsQuery,
} = financialApi;