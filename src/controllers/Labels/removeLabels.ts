import { google } from 'googleapis';
import { authenticated } from '../../google/index';
import { USER } from '../../constants/globalConstants';

const removeTheLabels = (auth, req) =>
	new Promise((resolve, reject) => {
		const gmail = google.gmail({ version: 'v1', auth });
		const { body } = req;

		function deleteLabel(body) {
			const { id } = body;
			return new Promise((resolve, reject) => {
				gmail.users.labels.delete(
					{
						userId: USER,
						id,
					},
					(err, res) => {
						if (err) {
							reject(new Error(`Create labels returned an error: ${err}`));
						}
						if (res && res.data) {
							resolve(res.data);
						} else {
							reject(new Error('No labels created...'));
						}
					}
				);
			});
		}
		if (body) {
			const labels = deleteLabel(body);
			if (labels) resolve(labels);
			reject(new Error('No labels created...'));
		}
	});

export const removeLabels = (req, res) => {
	authenticated
		.then((auth) => {
			removeTheLabels(auth, req).then((response) => {
				res.status(200).json({
					message: response,
				});
			});
		})
		.catch((err) => {
			res.status(404).json(err);
		})
		.catch((err) => {
			res.status(401).json(err);
		});
};