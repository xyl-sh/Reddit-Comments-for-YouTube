export function objectToFormData(r: any) {
	const formData = new FormData();
	Object.keys(r).forEach((key) => formData.append(key, r[key]));
	return formData;
}
