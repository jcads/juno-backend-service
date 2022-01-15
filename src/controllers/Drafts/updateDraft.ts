import { google } from 'googleapis';
import { authenticated } from '../../google/index';
import { USER } from '../../constants/globalConstants';

const exportDraft = (auth, req) =>
	new Promise((resolve, reject) => {
		const gmail = google.gmail({ version: 'v1', auth });

		const {
			body,
			subject,
			to,
			cc,
			bcc,
			sender,
			draftId,
			threadId,
			messageId,
			labelIds,
		} = req.body;
		const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString(
			'base64'
		)}?=`;
		const messageParts = [
			`From: ${sender}`,
			`To: ${to}`,
			`Cc: ${cc}`,
			`Bcc: ${bcc}`,
			'Content-Type: text/html; charset=utf-8',
			'MIME-Version: 1.0',
			`Subject: ${utf8Subject}`,
			'',
			`${body}`,
		];
		const message = messageParts.join('\n');

		// The body needs to be base64url encoded.
		const encodedMessage = Buffer.from(message)
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
		function initiateDraft(encodedMessage) {
			return new Promise((resolve, reject) => {
				gmail.users.drafts.update(
					{
						userId: USER,
						id: draftId,
						requestBody: {
							message: {
								raw: encodedMessage,
								id: messageId,
								threadId,
								labelIds,
							},
						},
					},
					(err, res) => {
						if (err) {
							reject(err);
						}
						const mail = res;
						if (mail !== null) {
							resolve(mail);
						} else {
							reject(new Error('Draft is not updated...'));
						}
					}
				);
			});
		}
		const finalMail = initiateDraft(encodedMessage);
		resolve(finalMail);
		reject(new Error('Draft is not updated...'));
	});

export const updateDraft = (req, res) => {
	authenticated
		.then((auth) => {
			exportDraft(auth, req).then((response) => {
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