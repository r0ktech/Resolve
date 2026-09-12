const prisma = require('../db/prisma');

async function getCustomers(req, res) {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    const where = {
      organizationId: req.organization.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { conversations: true },
        },
      },
      orderBy: { lastActiveAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    });

    const totalCount = await prisma.customer.count({ where });

    return res.json({ customers, totalCount });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch customer directory' });
  }
}

async function getCustomerById(req, res) {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        organizationId: req.organization.id,
      },
      include: {
        conversations: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({ customer });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch customer profile' });
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
};
