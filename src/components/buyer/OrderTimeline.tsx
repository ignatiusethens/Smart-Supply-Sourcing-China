'use client';

import { TimelineEvent, OrderStatus } from '@/types';
import { formatDate } from '@/lib/utils/formatting';

interface OrderTimelineProps {
  events: TimelineEvent[];
  currentStatus: OrderStatus;
}

const statusStages: OrderStatus[] = [
  'pending-payment',
  'payment-received',
  'processing',
  'shipped',
  'completed',
];

const stageLabels: Record<OrderStatus, string> = {
  'pending-payment': 'Payment Pending',
  'payment-received': 'Payment Received',
  'processing': 'Processing',
  'shipped': 'Shipped',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};

const stageDescriptions: Record<OrderStatus, string> = {
  'pending-payment': 'Waiting for payment confirmation',
  'payment-received': 'Payment confirmed, preparing order',
  'processing': 'Order is being prepared for shipment',
  'shipped': 'Order is on its way to you',
  'completed': 'Order delivered',
  'cancelled': 'Order has been cancelled',
};

export function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  const currentStageIndex = statusStages.indexOf(currentStatus);
  const isCompleted = currentStatus === 'completed';
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h3>

        {/* Timeline Stages */}
        <div className="space-y-6">
          {statusStages.map((stage, index) => {
            const isActive = index <= currentStageIndex && !isCancelled;
            const isCurrentStage = index === currentStageIndex;
            const event = events.find(e => e.status === stage);

            return (
              <div key={stage} className="flex gap-4">
                {/* Timeline Dot and Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isActive ? '✓' : index + 1}
                  </div>
                  {index < statusStages.length - 1 && (
                    <div
                      className={`w-1 h-12 mt-2 transition-colors ${
                        isActive ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>

                {/* Stage Content */}
                <div className="pb-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4
                        className={`font-semibold transition-colors ${
                          isActive ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {stageLabels[stage]}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {stageDescriptions[stage]}
                      </p>
                    </div>
                    {event && (
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(event.createdAt)}
                      </span>
                    )}
                  </div>
                  {event && event.description && (
                    <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Events */}
      {events.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`pb-4 ${
                  index < events.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
