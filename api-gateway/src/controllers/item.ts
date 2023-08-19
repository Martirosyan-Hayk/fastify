let items = [
  { id: '1', name: 'Item One' },
  { id: '2', name: 'Item Two' },
  { id: '3', name: 'Item Three' },
];

export const getItems = (_req, reply) => {
  reply.send(items);
};

export const getItem = (req, reply) => {
  const { id } = req.params;

  const item = items.find((itemm) => itemm.id === id);

  reply.send(item);
};

export const addItem = (req, reply) => {
  const { name } = req.body;
  const item = {
    id: '123124124124',
    name,
  };

  items = [...items, item];

  reply.code(201).send(item);
};

export const deleteItem = (req, reply) => {
  const { id } = req.params;

  items = items.filter((item) => item.id !== id);

  reply.send({ message: `Item ${id} has been removed` });
};
