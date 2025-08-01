import { billingSuccessResponse } from 'mocks-server/__mockdata__/billing';
import {
	licensesSuccessResponse,
	notOfTrailResponse,
	trialConvertedToSubscriptionResponse,
} from 'mocks-server/__mockdata__/licenses';
import { act, render, screen } from 'tests/test-utils';
import { getFormattedDate } from 'utils/timeUtils';

import BillingContainer from './BillingContainer';

jest.mock('uplot', () => {
	const paths = {
		spline: jest.fn(),
		bars: jest.fn(),
	};

	const uplotMock = jest.fn(() => ({
		paths,
	}));

	return {
		paths,
		default: uplotMock,
	};
});

window.ResizeObserver =
	window.ResizeObserver ||
	jest.fn().mockImplementation(() => ({
		disconnect: jest.fn(),
		observe: jest.fn(),
		unobserve: jest.fn(),
	}));

describe('BillingContainer', () => {
	jest.setTimeout(30000);

	test('Component should render', async () => {
		render(<BillingContainer />);

		const dataInjection = screen.getByRole('columnheader', {
			name: /data ingested/i,
		});
		expect(dataInjection).toBeInTheDocument();
		const pricePerUnit = screen.getByRole('columnheader', {
			name: /price per unit/i,
		});
		expect(pricePerUnit).toBeInTheDocument();
		const cost = await screen.findByRole('columnheader', {
			name: /cost \(billing period to date\)/i,
		});
		expect(cost).toBeInTheDocument();

		const dayRemainingInBillingPeriod = await screen.findByText(
			/Please upgrade plan now to retain your data./i,
		);
		expect(dayRemainingInBillingPeriod).toBeInTheDocument();

		const upgradePlanButton = screen.getByTestId('upgrade-plan-button');
		expect(upgradePlanButton).toBeInTheDocument();

		const dollar = await screen.findByText(/\$1,278.3/i);
		expect(dollar).toBeInTheDocument();

		const currentBill = await screen.findByText('billing');
		expect(currentBill).toBeInTheDocument();
	});

	test('OnTrail', async () => {
		await act(async () => {
			render(<BillingContainer />, undefined, undefined, {
				trialInfo: licensesSuccessResponse.data,
			});
		});

		const freeTrailText = await screen.findByText('Free Trial');
		expect(freeTrailText).toBeInTheDocument();

		const currentBill = await screen.findByText('billing');
		expect(currentBill).toBeInTheDocument();

		const dollar0 = await screen.findByText(/\$0/i);
		expect(dollar0).toBeInTheDocument();
		const onTrail = await screen.findByText(
			/You are in free trial period. Your free trial will end on 20 Oct 2023/i,
		);
		expect(onTrail).toBeInTheDocument();

		const numberOfDayRemaining = await screen.findByText(/1 days_remaining/i);
		expect(numberOfDayRemaining).toBeInTheDocument();
		const upgradeButton = await screen.findAllByRole('button', {
			name: /upgrade_plan/i,
		});
		expect(upgradeButton[1]).toBeInTheDocument();
		expect(upgradeButton.length).toBe(2);
		const checkPaidPlan = await screen.findByText(/checkout_plans/i);
		expect(checkPaidPlan).toBeInTheDocument();

		const link = await screen.findByRole('link', { name: /here/i });
		expect(link).toBeInTheDocument();
	});

	test('OnTrail but trialConvertedToSubscription', async () => {
		await act(async () => {
			render(<BillingContainer />, undefined, undefined, {
				trialInfo: trialConvertedToSubscriptionResponse.data,
			});
		});

		const currentBill = await screen.findByText('billing');
		expect(currentBill).toBeInTheDocument();

		const dollar0 = await screen.findByText(/\$0/i);
		expect(dollar0).toBeInTheDocument();

		const onTrail = await screen.findByText(
			/You are in free trial period. Your free trial will end on 20 Oct 2023/i,
		);
		expect(onTrail).toBeInTheDocument();

		const receivedCardDetails = await screen.findByText(
			/card_details_recieved_and_billing_info/i,
		);
		expect(receivedCardDetails).toBeInTheDocument();

		const manageBillingButton = await screen.findByRole('button', {
			name: /manage_billing/i,
		});
		expect(manageBillingButton).toBeInTheDocument();

		const dayRemainingInBillingPeriod = await screen.findByText(
			/1 days_remaining/i,
		);
		expect(dayRemainingInBillingPeriod).toBeInTheDocument();
	});

	test('Not on ontrail', async () => {
		const { findByText } = render(<BillingContainer />, undefined, undefined, {
			trialInfo: notOfTrailResponse.data,
		});

		const billingPeriodText = `Your current billing period is from ${getFormattedDate(
			billingSuccessResponse.data.billingPeriodStart,
		)} to ${getFormattedDate(billingSuccessResponse.data.billingPeriodEnd)}`;

		const billingPeriod = await findByText(billingPeriodText);
		expect(billingPeriod).toBeInTheDocument();

		const currentBill = await screen.findByText('billing');
		expect(currentBill).toBeInTheDocument();

		const dollar0 = await screen.findByText(/\$1,278.3/i);
		expect(dollar0).toBeInTheDocument();

		const metricsRow = await screen.findByRole('row', {
			name: /metrics 4012 Million 0.1 \$ 401.2/i,
		});
		expect(metricsRow).toBeInTheDocument();

		const logRow = await screen.findByRole('row', {
			name: /Logs 497 GB 0.4 \$ 198.8/i,
		});
		expect(logRow).toBeInTheDocument();
	});
});
