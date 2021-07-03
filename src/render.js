import Listr from 'listr';

export default (tasks) => {
  const listr = new Listr(tasks, { concurrent: true, exitOnError: false });
  return listr.run();
};
