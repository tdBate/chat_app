export class Message {
    constructor(message, date, user_id) {
        this.message = message;
        this.date = Date(date);
        this.user_id = user_id;
    }
}