export class Message {
    constructor(message, date, user_id, toId) {
        this.message = message;
        this.date = Date(date);
        this.user_id = user_id;
        this.toId = toId;
    }
}