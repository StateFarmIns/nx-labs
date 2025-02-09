import { formatFiles, Tree } from '@nx/devkit';
import { insertImport } from '../../utils/insert-import';
import { insertStatementAfterImports } from '../../utils/insert-statement-after-imports';
import { insertStatementInDefaultFunction } from '../../utils/insert-statement-in-default-function';
import { resolveRemixRouteFile } from '../../utils/remix-route-utils';
import { LoaderSchema } from './schema';

export default async function (tree: Tree, schema: LoaderSchema) {
  const routeFilePath = resolveRemixRouteFile(
    tree,
    schema.path,
    schema.project
  );

  if (!tree.exists(routeFilePath)) {
    throw new Error(
      `Route path does not exist: ${routeFilePath}. Please generate a Remix route first.`
    );
  }

  insertImport(tree, routeFilePath, 'useLoaderData', '@remix-run/react');
  insertImport(tree, routeFilePath, 'json', '@remix-run/node');
  insertImport(tree, routeFilePath, 'LoaderArgs', '@remix-run/node', {
    typeOnly: true,
  });

  insertStatementAfterImports(
    tree,
    routeFilePath,
    `
    export const loader = async ({request}: LoaderArgs ) => {
      return json({
        message: 'Hello, world!',
      })
    };

    `
  );

  const statement = `\nconst data = useLoaderData<typeof loader>();`;

  try {
    insertStatementInDefaultFunction(tree, routeFilePath, statement);
    // eslint-disable-next-line no-empty
  } catch (err) {
  } finally {
    await formatFiles(tree);
  }
}
