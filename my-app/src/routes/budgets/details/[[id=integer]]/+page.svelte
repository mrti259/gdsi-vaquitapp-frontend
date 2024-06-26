<script lang="ts">
	import { title } from '$lib';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { formatDateInput, formatMoney } from '$lib/formatter';

	export let data: PageData;
	const edit = data.budget.id !== 0;
	let timezoneOffset = 0;
	let budgetSuggestions: Map<string, Budget> = new Map();
	let categories: Category[] = [];

	async function onGroupUpdate(groupId: number) {
		await Promise.all([updateBudgetSuggestions(groupId), updateCategories(groupId)]);
	}

	async function updateBudgetSuggestions(groupId: number) {
		const newSuggestions: Map<string, Budget> = new Map();
		if (groupId != 0) {
			try {
				const response = await fetch(`/api/budgets?groupId=${groupId}`);
				const body: Budget[] = await response.json();
				body.forEach((budget) => {
					newSuggestions.set(budget.description, budget);
				});
			} catch {}
		}
		budgetSuggestions = newSuggestions;
	}

	async function updateCategories(groupId: number) {
		if (groupId != 0) {
			try {
				const response = await fetch(`/api/categories?groupId=${groupId}`);
				categories = await response.json();
				categories = categories.filter((category) => !category.is_archived);
				return;
			} catch {}
		}
		categories = [];
	}

	function autocomplete(value: string) {
		const budget = budgetSuggestions.get(value);
		if (!budget) return;
		data.budget.amount = budget.amount;
		data.budget.description = budget.description;
		data.budget.category_id = budget.category_id;
	}

	onMount(async () => {
		timezoneOffset = new Date().getTimezoneOffset();
		await onGroupUpdate(data.budget.group_id);
	});
</script>

<svelte:head>
	{#if edit}
		<title>{title} - Nuevo Presupuesto</title>
	{:else}
		<title>{title} - Editar Presupuesto</title>
	{/if}
</svelte:head>

<h2>
	{#if edit}Editando{:else}Creando{/if} Presupuesto
</h2>
<form method="POST" autocomplete="off">
	<fieldset>
		<input type="hidden" name="timezoneOffset" value={timezoneOffset} required />
		<label>
			Ingrese el grupo al que pertenece el presupuesto
			<select
				name="groupId"
				required
				aria-readonly={edit}
				bind:value={data.budget.group_id}
				on:change={(e) => onGroupUpdate(+e.currentTarget.value)}
			>
				{#each data.groups as group}
					<option value={group.id}>{group.name}</option>
				{/each}
			</select>
		</label>
		<label>
			Ingrese una descripción
			<input
				type="text"
				name="description"
				placeholder="Descripción"
				list="description-list"
				bind:value={data.budget.description}
				on:change={(e) => autocomplete(e.currentTarget.value)}
			/>
			<datalist id="description-list">
				{#each budgetSuggestions.values() as budget}
					<option value={budget.description}>{formatMoney(budget.amount)}</option>
				{/each}
			</datalist>
		</label>
		<label>
			Ingrese un monto
			<input type="number" name="amount" placeholder="Monto" required value={data.budget.amount} />
		</label>
		<label>
			Ingrese la categoría a la que pertenece el presupuesto
			<select name="categoryId" required value={data.budget.category_id}>
				{#each categories as category, i}
					<option value={i + 1}>{category.name}</option>
				{/each}
			</select>
		</label>
		<label>
			Ingrese la fecha de inicio del presupuesto
			<input
				type="date"
				name="startDate"
				placeholder="Fecha"
				required
				value={formatDateInput(data.budget.start_date)}
			/>
		</label>
		<label>
			Ingrese la fecha de fin del presupuesto
			<input
				type="date"
				name="endDate"
				placeholder="Fecha"
				required
				value={formatDateInput(data.budget.end_date)}
			/>
		</label>
		{#if edit}
			<button>Editar</button>
		{:else}
			<button>Crear</button>
		{/if}
		<button type="button" class="outline" on:click={() => history.back()}>Cancelar</button>
	</fieldset>
</form>
