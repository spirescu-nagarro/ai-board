import * as $ from "jquery";

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export function notify(message: string, type: NotificationType = 'error', timeout = 10000) {
    const notification = $('<div class="notification"></div>')
    notification.addClass(type)
    notification.html(message)
    $('#notifications').append(notification)
    setTimeout(() => {
        notification.remove()
    }, timeout)
}
