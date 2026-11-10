// A "catch-all" Prisma mock for permission tests: any prisma.<model>.<method>
// is a vi.fn() that resolves to a harmless empty value, and $transaction runs
// its callback with the same mock. Lets real actions/data functions run
// without a database. Every call is recorded in `calls`.
//
// usage in a test file:
//   vi.mock("@/lib/prisma", async () => {
//     const { prismaMock } = await import("../helpers/prisma-mock");
//     return { prisma: prismaMock.client };
//   });
import { vi, type Mock } from "vitest";

type ModelMock = Record<string, Mock>;
export type PrismaClientMock = Record<string, ModelMock> & {
	$transaction: Mock;
};

function defaultResult(method: string) {
	switch (method) {
		case "findMany":
		case "groupBy":
			return [];
		case "count":
			return 0;
		case "aggregate":
			return { _sum: { amount: null }, _count: { _all: 0 } };
		case "findUnique":
		case "findFirst":
			return null;
		case "createMany":
		case "updateMany":
		case "deleteMany":
			return { count: 0 };
		case "findUniqueOrThrow":
		case "findFirstOrThrow":
			throw new Error(`mock ${method}: no record`);
		default:
			// create, update, upsert, delete
			return { id: "mock-id" };
	}
}

function createPrismaMock() {
	const calls: string[] = [];
	const fns = new Map<string, Mock>();

	function modelProxy(model: string): ModelMock {
		return new Proxy({} as ModelMock, {
			get(_, method) {
				if (typeof method !== "string" || method === "then") return undefined;
				const key = `${model}.${method}`;
				if (!fns.has(key)) {
					fns.set(
						key,
						vi.fn(async () => {
							calls.push(key);
							return defaultResult(method);
						}),
					);
				}
				return fns.get(key);
			},
		});
	}

	const models = new Map<string, ModelMock>();

	// eslint-disable-next-line prefer-const
	let client: PrismaClientMock;

	const $transaction = vi.fn(async (arg: unknown) => {
		calls.push("$transaction");
		if (typeof arg === "function") return arg(client);
		return Promise.all(arg as Promise<unknown>[]);
	});

	client = new Proxy({} as PrismaClientMock, {
		get(_, prop) {
			if (prop === "$transaction") return $transaction;
			if (typeof prop !== "string" || prop === "then") return undefined;
			if (!models.has(prop)) models.set(prop, modelProxy(prop));
			return models.get(prop);
		},
	});

	return {
		client,
		calls,
		reset() {
			calls.length = 0;
			fns.clear();
			models.clear();
			$transaction.mockClear();
		},
	};
}

export const prismaMock = createPrismaMock();
