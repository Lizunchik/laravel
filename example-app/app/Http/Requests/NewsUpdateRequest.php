<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
			'category_id' => ['required', 'integer'],
			'title' => ['required', 'string', 'min:3', 'max:191'],
			'author' => ['required', 'string', 'min:3', 'max:100'],
			'image'  => ['sometimes'],
			'description' => ['sometimes']
        ];
    }

	public function messages(): array
	{
		return [
			'required' => 'Поле :attribute нужно заполнить!'
		];
	}

	public function attributes(): array
	{
		return  [
			'title' => 'заголовок',
			'author' => 'автор'
		];
	}
}