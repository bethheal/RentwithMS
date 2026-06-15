export const dashboardResponse = {
  success: true,
  message: 'Dashboard metrics loaded successfully.',
  data: {
    user: {
      name: 'Ada Mensah',
      role: 'Property Manager',
    },
    stats: [
      {
        id: 'stat-01',
        label: 'Active Listings',
        value: '124',
        change: '+12.4%',
      },
      {
        id: 'stat-02',
        label: 'Monthly Rent Collected',
        value: '$48,240',
        change: '+8.6%',
      },
      {
        id: 'stat-03',
        label: 'Open Maintenance Tickets',
        value: '19',
        change: '-6.3%',
      },
    ],
    activity: [
      'Unit 7B rent payment received at 09:12 AM',
      'New landlord account completed onboarding',
      'Maintenance request for Block C assigned to technician',
      'Three listings were published from draft status',
    ],
    tasks: [
      {
        id: 'task-01',
        title: 'Review pending tenant applications',
        status: 'Today',
      },
      {
        id: 'task-02',
        title: 'Approve March maintenance budget',
        status: 'Tomorrow',
      },
      {
        id: 'task-03',
        title: 'Update featured property availability',
        status: 'This week',
      },
    ],
  },
}
